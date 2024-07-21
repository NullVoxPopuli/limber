import { esmsh, jsdelivr } from './cdn.js';

/**
 * @param {import('../types.ts').ResolvedCompilerOptions} config
 * @param {import('../types.ts').PublicMethods} api
 */
export async function compiler(config = {}, api) {
  const versions = config.versions || {};

  const [
    babel,
    templatePlugin,
    { default: templateCompiler },
    { Preprocessor },
    { default: MacrosPlugin },
    { MacrosConfig },
    { buildPlugin: makeMacrosGlimmerPlugin },
    { default: AdjustImports },
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
     * Build-time macros
     * (partly because import.meta.env.DEV isn't standard
     *   partly because we needed more than what meta.env could offer)
     */
    '@embroider/macros/src/babel/macros-babel-plugin.js',
    '@embroider/macros/src/node.js',
    '@embroider/macros/src/glimmer/ast-transform.js',
    '@embroider/compat/src/babel-plugin-adjust-imports.js',
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
    console.log(templateCompiler, templatePlugin);
    return babel.transform(text, {
      filename: `dynamic-repl.js`,
      plugins: [
        [
          templatePlugin,
          {
            compiler: templateCompiler,
            transforms: [
              makeMacrosGlimmerPlugin({ methodName: 'makeFirstTransform' }),
              makeMacrosGlimmerPlugin({ methodName: 'makeSecondTransform' }),
            ],
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
        /**
         * TODO: I may need a safer browser-time implementation
         *       of @embroider/macros
         */
        [
          MacrosPlugin,
          {
            userConfigs: {},
            globalConfig: {
              '@embroider/macros': {
                isTesting: false,
              },
              WarpDrive: {
                debug: {
                  LOG_GRAPH: false,
                  LOG_IDENTIFIERS: false,
                  LOG_INSTANCE_CACHE: false,
                  LOG_MUTATIONS: false,
                  LOG_NOTIFICATIONS: false,
                  LOG_OPERATIONS: false,
                  LOG_PAYLOADS: false,
                  LOG_REQUESTS: false,
                  LOG_REQUEST_STATUS: false,
                },
                polyfillUUID: false,
                includeDataAdapter: true,
                compatWith: null,
                deprecations: {
                  DEPRECATE_CATCH_ALL: true,
                  DEPRECATE_COMPUTED_CHAINS: true,
                  DEPRECATE_EMBER_INFLECTOR: true,
                  DEPRECATE_LEGACY_IMPORTS: true,
                  DEPRECATE_MANY_ARRAY_DUPLICATES: true,
                  DEPRECATE_NON_STRICT_ID: true,
                  DEPRECATE_NON_STRICT_TYPES: true,
                  DEPRECATE_NON_UNIQUE_PAYLOADS: true,
                  DEPRECATE_RELATIONSHIP_REMOTE_UPDATE_CLEARING_LOCAL_STATE: true,
                  DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: true,
                  ENABLE_LEGACY_SCHEMA_SERVICE: true,
                },
                features: {
                  SAMPLE_FEATURE_FLAG: false,
                },
                env: {
                  TESTING: true,
                  PRODUCTION: false,
                  DEBUG: true,
                },
              },
              '@embroider/core': {
                active: true,
              },
            },
            owningPackageRoot: null,
            isDevelopingPackageRoots: ['/home/nvp/Development/tmp/my-fancy-app'],
            appPackageRoot: '/home/nvp/Development/tmp/my-fancy-app',
            embroiderMacrosConfigMarker: true,
            mode: 'run-time',
            hideRequires: true,
          },
        ],
        [
          AdjustImports,
          {
            appRoot: '/home/nvp/Development/tmp/my-fancy-app',
          },
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

      // if (id.startsWith('@embroider/macros')) {
      //   return `https://esm.sh/*@embroider/macros/src/addon/runtime.js`;
      // }
    },
    compile: async (text) => {
      let preprocessed = preprocessor.process(text, 'dynamic-repl.js');
      let transformed = await transform({ babel, templatePlugin, templateCompiler }, preprocessed);

      let code = transformed.code;
      console.log(code);
      return code;
    },
    render: async (element, compiled, extra, compiler) => {
      element.innerHTML = compiled.toString();
    },
  };
}
