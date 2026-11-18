import { extensionOf, NODE_MODULES_PREFIX } from '../../fs/url.js';
import { renderEmber } from './render.js';

const buildDependencies = [
  /**
   * Babel with only what this compiler uses, in the shape of `@babel/standalone`.
   * ember-repl provides it. Other hosts get `@babel/standalone` (see `resolve` in ../ember.js),
   * which has the same API and way too much stuff.
   */
  '@glimdown/babel-8-lite',
  /**
   * We will be using this decorator transform
   * instead of the babel one.
   * The babel transform does way too much transforming.
   */
  'decorator-transforms',

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
 * A pinned ember-source needs `ember-template-compiler/index.js`,
 * the ES module build of the template compiler. ember-source 6.10 is the first to ship it.
 *
 * @param {Parameters<CompilerFactory>[0]} config
 * @param {Parameters<CompilerFactory>[1]} api
 */
async function loadBuildDependencies(config, api) {
  const pinned = config.versions?.['ember-source'];

  try {
    return await api.tryResolveAll(buildDependencies);
  } catch (error) {
    if (!pinned) throw error;

    throw new Error(
      `ember-source ${pinned} cannot run in the REPL. Pin ember-source 6.10 or newer, ` +
        `because older versions have no ES module build of the template compiler.`,
      { cause: error }
    );
  }
}

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

  const [
    _babel,
    _decoratorTransforms,
    _emberTemplateCompilation,
    compiler,
    contentTag,
    { default: DebugMacros },
    // embroiderMacros,
  ] = await loadBuildDependencies(config, api);

  // These libraries are compiled incorrectly for cjs<->ESM compat
  const decoratorTransforms =
    'default' in _decoratorTransforms ? _decoratorTransforms.default : _decoratorTransforms;

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
   * @param {string} text
   */
  async function transform(text) {
    return babel.transformAsync(text, {
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
    render: async (element, compiled, extra, compiler) => {
      const destroy = await renderEmber(config, element, compiled, extra, compiler);

      compiler.announce('info', 'Ember Island Rendered');

      return destroy;
    },
    plugins: [
      {
        name: `repl-sdk:ember:npm-${ext}`,

        /**
         * Files from npm get the same build as the document.
         */
        async transform(code, url) {
          if (!url.startsWith(NODE_MODULES_PREFIX)) return;

          const extension = extensionOf(url);

          if (extension !== ext && extension !== `m${ext}`) return;

          return /** @type {string} */ (await gjsCompiler.compile(code, {}));
        },
      },
    ],
  };

  return gjsCompiler;
}
