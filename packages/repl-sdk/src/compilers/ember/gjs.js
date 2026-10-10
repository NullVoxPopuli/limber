import { makeOwner } from './owner.js';

let elementId = 0;

/**
 * What both `compile` and `toSource` use.
 */
const buildDependencies = [
  /**
   * Babel with only what this compiler uses, in the shape of `@babel/standalone`.
   * ember-repl provides it. Other hosts get `@babel/standalone` (see `resolve` in ../ember.js),
   * which has the same API and way too much stuff.
   */
  '@glimdown/babel-8-lite',
  /**
   * Babel plugin that understands all the different ways
   * which templates have been authored and what they need to
   * compile to over the years.
   */
  'babel-plugin-ember-template-compilation',
  /**
   * The actual template-compiler is ember-sounce-dependent,
   * because the underlying format / bytecodes / etc is private,
   * and can change between versions of ember-source.
   */
  'ember-source/ember-template-compiler/index.js',
  /**
   * Converts gjs/gts to standard js/ts
   */
  'content-tag',
];

/**
 * What only `compile` uses, because only `compile` makes code for this runtime.
 * A host that only calls `toSource` does not need to provide these.
 */
const runtimeDependencies = [
  /**
   * We will be using this decorator transform
   * instead of the babel one.
   * The babel transform does way too much transforming.
   */
  'decorator-transforms',
  /**
   * Older-style build macros
   * (before import.meta.env was even a thing)
   *
   * These remove `@glimmer/env` and DEBUG usages
   */
  'babel-plugin-debug-macros',

  /**
   * build macros, because the ecosystem isn't standardized on imprt.meta.env?.X
   * Also, @embroider/macros does dead-code-elimination, which is handy.
   */
  // '@embroider/macros/babel',
];

/**
 * @typedef {import('../../types.ts').CompilerConfig['compiler']} CompilerFactory
 */

/**
 * gjs and gts share one pipeline.
 * gts adds the babel typescript plugin, which only strips types.
 *
 * @param {Parameters<CompilerFactory>[0]} config
 * @param {Parameters<CompilerFactory>[1]} api
 * @param {{ typescript?: boolean }} [flags]
 */
export async function compiler(config, api, flags = {}) {
  const typescript = flags.typescript ?? false;
  const ext = typescript ? 'ts' : 'js';
  const filename = `dynamic-repl.${ext}`;

  const [_babel, _emberTemplateCompilation, compiler, contentTag] =
    await api.tryResolveAll(buildDependencies);

  // These libraries are compiled incorrectly for cjs<->ESM compat
  const emberTemplateCompilation =
    'default' in _emberTemplateCompilation
      ? _emberTemplateCompilation.default
      : _emberTemplateCompilation;

  const babel = 'availablePlugins' in _babel ? _babel : _babel.default;

  // let macros = embroiderMacros.buildMacros();

  /**
   * Types must be gone before the template plugin runs.
   *
   * onlyRemoveTypeImports keeps value imports that are only used in templates.
   * allowDeclareFields matches how ember apps configure typescript.
   *
   * @type {unknown[]}
   */
  const typePlugins = typescript
    ? [
        [
          babel.availablePlugins['transform-typescript'],
          { allowDeclareFields: true, onlyRemoveTypeImports: true },
        ],
      ]
    : [];

  /**
   * Babel must not read the babel config of a project.
   * That config is for the build of the project, and in Node, babel finds it.
   */
  const isolated = { configFile: false, babelrc: false };

  /**
   * @param {string} text
   */
  async function transform(text) {
    const [_decoratorTransforms, { default: DebugMacros }] =
      await api.tryResolveAll(runtimeDependencies);

    // This library is compiled incorrectly for cjs<->ESM compat
    const decoratorTransforms =
      'default' in _decoratorTransforms ? _decoratorTransforms.default : _decoratorTransforms;

    return babel.transformAsync(text, {
      ...isolated,
      filename,
      plugins: typePlugins.concat([
        [
          emberTemplateCompilation,
          {
            compiler,
            transforms: [
              // ...macros.templateMacros
            ],
            targetFormat: 'wire',
          },
        ],
        [
          // @ts-ignore - we don't care about types here..
          decoratorTransforms,
          {
            runtime: {
              import: 'decorator-transforms/runtime-esm',
            },
          },
        ],
        // ...macros.babelMacros,
        [
          DebugMacros,
          {
            flags: [
              {
                source: '@glimmer/env',
                flags: {
                  DEBUG: true,
                  CI: false,
                },
              },
            ],
            debugTools: {
              isDebug: true,
              source: '@ember/debug',
              assertPredicateIndex: 1,
            },
            externalizeHelpers: {
              module: '@ember/debug',
            },
          },
          '@ember/debug stripping',
        ],
        [
          DebugMacros,
          {
            externalizeHelpers: {
              module: '@ember/application/deprecations',
            },
            debugTools: {
              isDebug: true,
              source: '@ember/application/deprecations',
              assertPredicateIndex: 1,
            },
          },
          '@ember/application/deprecations stripping',
        ],
      ]),
      presets: [],
    });
  }

  /**
   * Does only what a build can not do later, or what the caller needs now:
   * types go away, and each template gets an explicit scope.
   *
   * The explicit scope lets a tool rename or move the code around the template.
   * The template is still text, so it is not tied to one version of ember-source.
   *
   * @param {string} text
   */
  async function transformToSource(text) {
    return babel.transformAsync(text, {
      ...isolated,
      filename,
      parserOpts: { plugins: ['decorators'] },
      plugins: typePlugins.concat([[emberTemplateCompilation, { compiler, targetFormat: 'hbs' }]]),
      presets: [],
    });
  }

  const preprocessor = new contentTag.Preprocessor();

  /**
   * @type {import('../../types.ts').Compiler}
   */
  const gjsCompiler = {
    compile: async (text, options) => {
      const { code: preprocessed } = preprocessor.process(text, {
        filename: `dynamic-repl.g${ext}`,
      });
      const transformed = await transform(preprocessed);

      const code = transformed.code;

      return code;
    },
    toSource: async (text) => {
      const { code: preprocessed } = preprocessor.process(text, {
        filename: `dynamic-repl.g${ext}`,
      });
      const transformed = await transformToSource(preprocessed);

      return transformed.code;
    },
    render: async (element, compiled, extra, compiler) => {
      /**
       *
       * TODO: These will make things easier:
       *    https://github.com/emberjs/rfcs/pull/1099
       *    https://github.com/ember-cli/ember-addon-blueprint/blob/main/files/tests/test-helper.js
       */
      const attribute = `data-repl-sdk-ember-gjs-${elementId++}`;

      element.setAttribute(attribute, '');

      const { renderComponent } = await compiler.tryResolve('@ember/renderer');

      const owner = makeOwner(config.owner);
      const args = /** @type {Record<string, unknown> | undefined} */ (
        extra && typeof extra === 'object' && 'args' in extra
          ? /** @type {Record<string, unknown>} */ (extra).args
          : undefined
      );
      const result = renderComponent(compiled, {
        into: element,
        owner,
        ...(args ? { args } : {}),
      });

      compiler.announce('info', 'Ember Island Rendered');

      return () => result.destroy();
    },
    handlers: {
      [ext]: async (text) => {
        return gjsCompiler.compile(text, {});
      },
      [`m${ext}`]: async (text) => {
        return gjsCompiler.compile(text, {});
      },
    },
  };

  return gjsCompiler;
}
