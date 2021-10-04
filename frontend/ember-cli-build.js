'use strict';

const path = require('path');
const yn = require('yn');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let environment = EmberApp.env();
  let isProduction = environment === 'production';

  let SOURCEMAPS = yn(process.env.SOURCEMAPS) ?? false;
  let MAXIMUM_STATIC = yn(process.env.MAXIMUM_STATIC) ?? true;
  let MINIFY = yn(process.env.MINIFY) ?? isProduction;

  console.info(`
    Building:
      SOURCEMAPS: ${SOURCEMAPS}
      MINIFY: ${MINIFY}
      MAXIMUM_STATIC: ${MAXIMUM_STATIC}
      NODE_ENV: ${process.env.NODE_ENV}

      isProduction: ${isProduction}
  `);

  let config = {
    sourcemaps: {
      enabled: SOURCEMAPS,
    },
    'ember-cli-terser': {
      enabled: MINIFY,
    },
    fingerprint: {
      exclude: ['transpilation-worker.js'],
    },
  };

  let app = new EmberApp(defaults, config);

  // Adds:
  //  - ember-template-compiler
  //  - @glimmer/syntax
  app.import('vendor/ember/ember-template-compiler.js');

  const rootURL = app.options.project.config(environment).rootURL;
  const productionOnly = (plugin) => (isProduction ? [plugin] : []);

  const { Webpack } = require('@embroider/webpack');
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
  const AssetsWebpackPlugin = require('assets-webpack-plugin');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    extraPublicTrees: [
      // Mobile Editor
      require('@nullvoxpopuli/limber-codemirror/broccoli-funnel')(),
      // Desktop Editor
      require('@nullvoxpopuli/limber-monaco/broccoli-funnel')(),
      // COMPONENT_MAP,
      require('ember-repl').buildComponentMap([
        'limber/components/limber/menu',
        'limber/components/limber/header',
        'limber/components/external-link',
        'limber/components/shadowed',
        'limber/components/popper-j-s',
        'ember-repl',
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
    ],
    ...(MAXIMUM_STATIC
      ? {
          staticAddonTrees: true,
          staticAddonTestSupportTrees: true,
          staticHelpers: true,
          staticComponents: true,
          splitControllers: true,
          splitRouteClasses: true,
          // staticAppPaths: [],
          // splitAtRoutes: [],
        }
      : {}),
    implicitModulesStrategy: 'packageNames',
    packagerOptions: {
      webpackConfig: {
        devtool: isProduction ? 'source-map' : false,
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
            {
              test: /\.css$/i,
              include: path.resolve(__dirname, 'app'),
              use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
          ],
        },
        resolve: {
          alias: {
            path: 'path-browserify',
          },
        },
        node: {
          global: false,
          __filename: true,
          __dirname: true,
        },
        plugins: [
          new WebpackManifestPlugin({
            fileName: 'webpack-manifest.json',
            isAsset: true,
          }),
          new AssetsWebpackPlugin({
            filename: 'manifest-assets-webpack-plugin.js',
            path: path.join(__dirname, 'public/assets'),
            metadata: {
              rootURL,
              isProduction,
            },
          }),
          ...productionOnly(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
              reportFilename: 'bundle.html',
            })
          ),
        ],
      },
    },
    // required due to this app being a dynamic component generator
    allowUnsafeDynamicComponents: true,
  });
};
