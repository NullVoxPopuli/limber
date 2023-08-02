'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = async function (defaults) {
  // ESM-only dependencies
  const { default: yn } = await import('yn');

  let environment = EmberApp.env();
  let isProduction = environment === 'production';

  let MINIFY = yn(process.env.MINIFY) ?? isProduction;

  console.info(`
    Building:
      MINIFY: ${MINIFY}
      NODE_ENV: ${process.env.NODE_ENV}

      isProduction: ${isProduction}
  `);

  let config = {
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
    'ember-cli-terser': {
      enabled: MINIFY,
    },
    babel: {
      loose: true,
    },
    // 'ember-cli-babel': {
    //   useBabelConfig: true,
    // },
    fingerprint: { exclude: ['transpilation-worker.js'] },
  };

  let app = new EmberApp(defaults, config);

  // Adds:
  //  - ember-template-compiler
  //  - @glimmer/syntax
  app.import('vendor/ember/ember-template-compiler.js');

  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

  const { EsbuildPlugin } = require('esbuild-loader');

  return require('@embroider/compat').compatBuild(app, undefined, {
    extraPublicTrees: [
      require('@nullvoxpopuli/limber-codemirror/broccoli-funnel')(),
      // Tailwind
      require('@nullvoxpopuli/limber-styles/broccoli-funnel')(),
      // COMPONENT_MAP,
      require('ember-repl/ember-cli').buildComponentMap([
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
        'ember-resources/link',
        'ember-resources/service',
        'ember-resources/modifier',
        'ember-resources/util/map',
        'ember-resources/util/keep-latest',
        'ember-resources/util/function',
        'ember-resources/util/fps',
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
    staticAppPaths: ['utils'],
    // splitAtRoutes: [],
    implicitModulesStrategy: 'packageNames',
    // required due to this app being a dynamic component generator
    allowUnsafeDynamicComponents: true,
    packagerOptions: {
      webpackConfig: {
        // embroider 1.8.3 might have an issues with gts + sourcemaps?
        devtool: false,
        // devtool: 'source-map',
        // devtool: isProduction ? 'source-map' : false,
        experiments: {
          // Causes app to not boot
          // lazyCompilation: true,
        },
        // output: {
        //   Causes app to not boot
        //   chunkFormat: 'module',
        // },
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
            new EsbuildPlugin({
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
        plugins: isProduction
          ? [
              new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: false,
                reportFilename: 'bundle.html',
              }),
            ]
          : [],
      },
    },
  });
};
