import { esmsh } from './cdn.js';

/**
 * @param {import('../types.ts').ResolvedCompilerOptions} config
 * @param {import('../types.ts').PublicMethods} api
 */
export async function compiler(config = {} /*, api */) {
  const versions = config.versions || {};

  const [
    babel,
    templatePlugin,
    { default: templateCompiler },
    { Preprocessor },
    { default: DebugMacros },
  ] = await esmsh.importAll(versions, [
    /**
     * The only version of babel that is easily runnable in the browser
     * This includes way too much stuff.
     */
    '@babel/standalone',
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
    // Failed to load (will need to PR for browser support),
    //   so we have to use babel's decorator transforms,
    //   which ... aren't great.
    //   They force over-transforming of classes.
    // 'decorator-transforms',
  ]);

  async function transform(text) {
    return babel.transform(text, {
      filename: `dynamic-repl.js`,
      plugins: [
        [
          templatePlugin,
          {
            compiler: templateCompiler,
            transforms: [],
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
        // [babel.availablePlugins['proposal-decorators'], { legacy: true }],
        // [babel.availablePlugins['proposal-class-properties']],
      ],
      presets: [
        [
          babel.availablePresets['env'],
          {
            modules: false,
            targets: {
              browsers: [
                'last 1 Chrome versions',
                'last 1 Firefox versions',
                'last 1 Safari versions',
              ],
            },
          },
        ],
      ],
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

      console.log({ id });

      if (id.startsWith('@embroider/macros')) {
        return `repl-sdk/compilers/ember/macros.js`;
      }
    },
    compile: async (text) => {
      let preprocessed = preprocessor.process(text, 'dynamic-repl.js');
      let transformed = await transform(preprocessed);

      let code = transformed.code;

      // eslint-disable-next-line
      console.log({ code });

      return code;
    },
    render: async (element, compiled /*, extra, compiler */) => {
      element.innerHTML = compiled.toString();
    },
  };
}
