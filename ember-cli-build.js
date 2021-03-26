'use strict';

const yn = require('yn');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const mergeTrees = require('broccoli-merge-trees');
const { monacoFunnel } = require('./lib/monaco');

module.exports = function (defaults) {
  let environment = EmberApp.env();
  let isProduction = environment === 'production';

  let SOURCEMAPS = yn(process.env.SOURCEMAPS) ?? false;
  let MAXIMUM_STATIC = yn(process.env.MAXIMUM_STATIC) ?? false;
  let MINIFY = yn(process.env.MINIFY) ?? isProduction;

  console.info(`
    Building:
      SOURCEMAPS: ${SOURCEMAPS}
      MINIFY: ${MINIFY}
      MAXIMUM_STATIC: ${MAXIMUM_STATIC}

      isProduction: ${isProduction}
  `);

  let config = {
    sourcemaps: {
      enabled: SOURCEMAPS,
    },
    'ember-cli-terser': {
      enabled: MINIFY,
    },
    autoImport: {
      alias: {
        // 'split-grid': 'split-grid/dist/'
      }
    },
    postcssOptions: {
      compile: {
        map: SOURCEMAPS,
        plugins: [require('@tailwindcss/jit')('./tailwind.config.js'), require('autoprefixer')()],
        cacheInclude: [/.*\.(css|hbs)$/, /.tailwind\.config\.js$/],
      },
    },
  };

  let app = new EmberApp(defaults, config);

  let additionalTrees = [
    // workersFunnel({ isProduction }),
    monacoFunnel({ isProduction }),
  ];

  app.import('vendor/ember/ember-template-compiler.js');

  const { Webpack } = require('@embroider/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    extraPublicTrees: additionalTrees,
    skipBabel: [
      {
        package: 'qunit',
      },
      {
        package: 'split-grid',
      }
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
    packagerOptions: {
      webpackConfig: {
        // this option might not be working?
        devtool: SOURCEMAPS ? 'eval-source-map' : 'none',
      },
    },
    // required due to this app being a dynamic component generator
    allowUnsafeDynamicComponents: true,
  });
};
