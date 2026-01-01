// import { makeOwner } from './owner.js';
import { renderApp } from './render-app-island.js';

let elementId = 0;

const buildDependencies = [
  /**
   * The only version of babel that is easily runnable in the browser
   * This includes way too much stuff.
   */
  '@babel/standalone',
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
  'ember-source/dist/ember-template-compiler.js',
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
  'oxc-parser',
  'zimmerframe',
];

const babelRequiredImports = [
  // Templates
  '@ember/template-compiler',
  '@ember/template-compilation',

  // Macros
  '@embroider/macros',
  '@glimmer/env',
  '@ember/application/deprecations',
  // macros only needed in prod
  '@ember/debug',
];

/**
 * @type {import('../../types.ts').CompilerConfig['compiler']}
 */
export async function compiler(config, api) {
  const [
    _babel,
    _decoratorTransforms,
    _emberTemplateCompilation,
    compiler,
    contentTag,
    { default: DebugMacros },
    // embroiderMacros,
    oxcParser,
    zimmerframe,
  ] = await api.tryResolveAll(buildDependencies);

  // These libraries are compiled incorrectly for cjs<->ESM compat
  const decoratorTransforms =
    'default' in _decoratorTransforms ? _decoratorTransforms.default : _decoratorTransforms;

  const emberTemplateCompilation =
    'default' in _emberTemplateCompilation
      ? _emberTemplateCompilation.default
      : _emberTemplateCompilation;

  const babel = 'availablePlugins' in _babel ? _babel : _babel.default;

  /**
   * @param {string} code
   * @param {string} url
   * @param {string} ext
   */
  async function shouldUseBabel(code, url, ext) {
    const lang = ext === 'gjs' ? 'js' : ext === 'gts' ? 'ts' : ext;

    const estree = await oxcParser.parseSync(url, code, { lang });

    let hasDecorators = false;
    let hasBabelRequiredImport = false;

    zimmerframe.walk(
      estree.program,
      /* state */ {},
      {
        Decorator(_node, { stop }) {
          hasDecorators = true;
          stop();
        },
        ImportDeclaration(node, { stop }) {
          if (babelMacros.has(node.source.value)) {
            hasBabelRequiredImport = true;
            stop();
          }
        },
      }
    );
    return hasDecorators || hasBabelRequiredImport;
  }

  /**
   * @param {string} text
   */
  async function transform(text) {
    return babel.transformAsync(text, {
      filename: `dynamic-repl.js`,
      plugins: [
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
      ],
      presets: [],
    });
  }

  const preprocessor = new contentTag.Preprocessor();

  /**
   * @type {import('../../types.ts').Compiler}
   */
  const gjsCompiler = {
    compile: async (text, options) => {
      const { code: preprocessed } = preprocessor.process(text, { filename: 'dynamic-repl.js' });
      const transformed = await transform(preprocessed);

      const code = transformed.code;

      return code;
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

      // ------------------------------------------------
      // https://github.com/emberjs/ember.js/issues/21023
      // ------------------------------------------------
      //
      // const { renderComponent } = await compiler.tryResolve('@ember/renderer');
      //
      // const owner = makeOwner(config.owner);
      // const result = renderComponent(compiled, { into: element, owner });
      //
      // return () => result.destroy();

      const [application, destroyable, resolver, router, route, testWaiters, runloop] =
        await compiler.tryResolveAll([
          '@ember/application',
          '@ember/destroyable',
          'ember-resolver',
          '@ember/routing/router',
          '@ember/routing/route',
          '@ember/test-waiters',
          '@ember/runloop',
        ]);

      return renderApp({
        element,
        selector: `[${attribute}]`,
        component: compiled,
        log: compiler.announce,
        modules: {
          application,
          destroyable,
          resolver,
          router,
          route,
          testWaiters,
          runloop,
        },
      });
    },
    handlers: {
      js: async (text, url) => {
        if (await shouldUseBabel(text, url, 'js')) {
          return gjsCompiler.compile(text, {});
        }
        return text;
      },
      mjs: async (text, url) => {
        if (await shouldUseBabel(text, url, 'js')) {
          return gjsCompiler.compile(text, {});
        }
        return text;
      },
    },
  };

  return gjsCompiler;
}
