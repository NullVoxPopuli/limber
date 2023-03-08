'use strict';

const yn = require('yn');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let environment = EmberApp.env();
  let isProduction = environment === 'production';

  let MINIFY = yn(process.env.MINIFY) ?? isProduction;

  console.info(`
    Building:
      MINIFY: ${MINIFY}
      NODE_ENV: ${process.env.NODE_ENV}

      isProduction: ${isProduction}
  `);

  let app = new EmberApp(defaults, {
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
    'ember-cli-terser': {
      enabled: MINIFY,
    },
    fingerprint: { exclude: ['transpilation-worker.js'] },
    sourcemaps: { enabled: true, extensions: ['js', 'css', 'ts', 'gjs', 'gts', 'hbs'] },
    bundleAnalyzer: {
      enabled: true,
    },
    autoImport: {
      webpackConfig: {
        devtool: 'source-map',
      }
    }
  });

  // Adds:
  //  - ember-template-compiler
  //  - @glimmer/syntax
  app.import('vendor/ember/ember-template-compiler.js');

  const { Webpack } = require('@embroider/webpack');

  const { ESBuildMinifyPlugin } = require('esbuild-loader');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    extraPublicTrees: [
      require('@nullvoxpopuli/limber-codemirror/broccoli-funnel')(),
      // Tailwind
      require('@nullvoxpopuli/limber-styles/broccoli-funnel')(),
      // COMPONENT_MAP,
      require('ember-repl').buildComponentMap([
        'limber/components/limber/menu',
        'limber/components/limber/header',
        'limber/components/external-link',
        'limber/components/shadowed',
        'limber/helpers/state',
        'ember-popperjs',
        'ember-repl',
        'xstate',
        'ember-modifier',
        'tracked-built-ins',
        'ember-headlessui/components/menu',
        'ember-focus-trap/modifiers/focus-trap',
        'ember-resources',
        'ember-resources/core',
        'ember-resources/util/map',
        'ember-resources/util/keep-latest',
        'ember-resources/util/function',
        'ember-resources/util/function-resource',
        'ember-resources/util/remote-data',
      ]),
    ],
    skipBabel: [
      {
        package: 'qunit',
      },
      {
        package: '@babel/standalone',
      },
      {
        package: 'babel-plugin-htmlbars-inline-precompile',
      },
      {
        package: '@nullvoxpopuli/limber-codemirror',
      },
    ],
    staticAddonTrees: true,
    staticAddonTestSupportTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    splitControllers: true,
    splitRouteClasses: true,
    // staticAppPaths: [],
    // splitAtRoutes: [],
    implicitModulesStrategy: 'packageNames',
    // required due to this app being a dynamic component generator
    allowUnsafeDynamicComponents: true,
    packagerOptions: {
      webpackConfig: {
        devtool: 'source-map',
        // devtool: isProduction ? 'source-map' : false,
        experiments: {
          // Causes app to not boot
          // lazyCompilation: true,
        },
        output: {
        //   Causes app to not boot
        //   chunkFormat: 'module',
        },
        resolve: {
          alias: {
            path: 'path-browserify',
          },
          fallback: {
            path: require.resolve('path-browserify'),
          },
        },
        optimization: {
          minimizer: [
            new ESBuildMinifyPlugin({
              legalComments: 'none',
              sourcemap: true,
              minify: isProduction,
              css: true,
              exclude: [/codemirror/],
            }),
          ],
        },
        node: {
          global: false,
          __filename: true,
          __dirname: true,
        },
      },
    },
  });
};
