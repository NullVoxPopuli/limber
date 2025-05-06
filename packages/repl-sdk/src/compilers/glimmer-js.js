import { esmsh } from './cdn.js';

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
];

/**
 * @param {import('../types.ts').ResolvedCompilerOptions} config
 * @param {import('../types.ts').PublicMethods} api
 */
export async function compiler(config = {}, api) {
  const versions = config.versions || {};

  const [
    _babel,
    _decoratorTransforms,
    _emberTemplateCompilation,
    compiler,
    { Preprocessor },
    { default: DebugMacros },
  ] = await api.tryResolveAll(buildDependencies, (moduleName) =>
    esmsh.import(versions, moduleName)
  );

  // These libraries are compiled incorrectly for cjs<->ESM compat
  const decoratorTransforms =
    'default' in _decoratorTransforms ? _decoratorTransforms.default : _decoratorTransforms;

  const emberTemplateCompilation =
    'default' in _emberTemplateCompilation
      ? _emberTemplateCompilation.default
      : _emberTemplateCompilation;

  let babel = 'availablePlugins' in _babel ? _babel : _babel.default;

  async function transform(text) {
    return babel.transform(text, {
      filename: `dynamic-repl.js`,
      plugins: [
        [
          emberTemplateCompilation,
          {
            compiler,
            transforms: [],
            targetFormat: 'wire',
          },
        ],
        [
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - we don't care about types here..
          decoratorTransforms,
          {
            runtime: {
              import: 'decorator-transforms/runtime',
            },
          },
        ],
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

  const preprocessor = new Preprocessor();

  return {
    resolve: (id) => {
      if (id.startsWith('@ember')) {
        return `https://esm.sh/*ember-source/dist/packages/${id}`;
      }

      if (id.startsWith('@glimmer')) {
        return `https://esm.sh/*ember-source/dist/dependencies/${id}.js`;
      }

      console.log('custom resolve for compiler', { id });

      if (id.startsWith('@embroider/macros')) {
        return `repl-sdk/compilers/ember/macros.js`;
      }
    },
    compile: async (text) => {
      let { code: preprocessed } = preprocessor.process(text, { filename: 'dynamic-repl.js' });
      let transformed = await transform(preprocessed);

      let code = transformed.code;

      console.log('[compile:code]', code);

      return code;
    },
    render: async (element, compiled /*, extra, compiler */) => {
      console.log('[render:compiled]', compiled);

      /**
       *
       * TODO: These will make things easier:
       *    https://github.com/emberjs/rfcs/pull/1099
       *    https://github.com/ember-cli/ember-addon-blueprint/blob/main/files/tests/test-helper.js
       */
      element.innerHTML = compiled.toString();
    },
  };
}
