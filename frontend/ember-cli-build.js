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

  let config = {
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

  const { Webpack } = require('@embroider/webpack');
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

  const { ESBuildMinifyPlugin } = require('esbuild-loader');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    extraPublicTrees: [
      // Mobile Editor
      require('@nullvoxpopuli/limber-codemirror/broccoli-funnel')(),
      // Desktop Editor
      require('@nullvoxpopuli/limber-monaco/broccoli-funnel')(),
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
        'ember-headlessui/components/menu',
        'ember-focus-trap/modifiers/focus-trap',
      ]),
    ],
    skipBabel: [
      {
        package: 'qunit',
      },
      {
        package: 'monaco-editor',
      },
      {
        package: '@babel/standalone',
      },
      {
        package: 'codemirror/preconfigured.js',
      },
      {
        package: 'monaco/preconfigured.js',
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
    packagerOptions: {
      webpackConfig: {
        devtool: 'source-map',
        // devtool: isProduction ? 'source-map' : false,
        experiments: {
          // Causes app to not boot
          // lazyCompilation: true,
        },
        // output: {
        //   Causes app to not boot
        //   chunkFormat: 'module',
        // },
        module: {
          rules: [
            {
              test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
              use: ['file-loader'],
            },
            {
              test: /codicon\.ttf$/,
              use: [
                {
                  loader: 'ignore-loader',
                },
              ],
            },
          ],
        },
        resolve: {
          alias: {
            path: 'path-browserify',
          },
        },
        optimization: {
          minimizer: [
            new ESBuildMinifyPlugin({
              legalComments: 'none',
              sourcemap: false,
              minify: isProduction,
              css: true,
              exclude: [/monaco/, /codemirror/],
            }),
          ],
        },
        node: {
          global: false,
          __filename: true,
          __dirname: true,
        },
        plugins: [
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle.html',
          }),
        ],
      },
    },
    // required due to this app being a dynamic component generator
    allowUnsafeDynamicComponents: true,
  });
};
