'use strict';

const yn = require('yn');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const mergeTrees = require('broccoli-merge-trees');

const SOURCEMAPS = yn(process.env.SOURCEMAPS);
const CLASSIC = yn(process.env.CLASSIC);
const MAXIMUM_STATIC = yn(process.env.MAXIMUM_STATIC);
const MINIFY = yn(process.env.MINIFY) ?? true;

module.exports = function (defaults) {
  let environment = EmberApp.env();
  let isProduction = environment === 'production';

  console.info(`
    Building:
      SOURCEMAPS: ${SOURCEMAPS}
      CLASSIC: ${CLASSIC}
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
    postcssOptions: {
      compile: {
        map: SOURCEMAPS,
        plugins: [require('@tailwindcss/jit')('./tailwind.config.js'), require('autoprefixer')()],
        cacheInclude: [/.*\.(css|hbs)$/, /.tailwind\.config\.js$/],
      },
    },
  };

  if (CLASSIC) {
    config.babel = {
      // enables dynamic imports
      plugins: [require.resolve('ember-auto-import/babel-plugin')],
    };
    config.autoImport = {
      alias: {
        // '@ember/template-compiler': 'vendor/ember/ember-template-compiler.js',
      },
    };
  }

  let app = new EmberApp(defaults, config);

  let additionalTrees = [
    // workersFunnel({ isProduction }),
    // monacoFunnel({ isProduction }),
  ];

  app.import('vendor/ember/ember-template-compiler.js');

  if (CLASSIC) {
    return mergeTrees([app.toTree(), ...additionalTrees]);
  }

  const { Webpack } = require('@embroider/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    additionalTrees,
    skipBabel: [
      {
        package: 'qunit',
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
