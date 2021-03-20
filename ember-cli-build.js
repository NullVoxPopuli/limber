'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const {SOURCEMAPS: _sourceMaps} = process.env;

const SOURCEMAPS = _sourceMaps === 'true'; // default false

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    babel: {
      // enables dynamic imports
      // plugins: [require.resolve('ember-auto-import/babel-plugin')],
    },
    // autoImport: {
    //   alias: {
    //     // when the app tries to import from "plotly.js", use
    //     // the real package "plotly.js-basic-dist" instead.
    //     // '@ember/template-compiler': 'vendor/ember/ember-template-compiler.js',
    //   },
    // },
    sourcemaps: {
      enabled: SOURCEMAPS,
    },
    postcssOptions: {
      compile: {
        map: SOURCEMAPS,
        plugins: [
          require('@tailwindcss/jit')('./tailwind.config.js'),
          require('autoprefixer')(),
        ],
        cacheInclude: [/.*\.(css|hbs)$/, /.tailwind\.config\.js$/],
      },
    }
  });

  app.import('vendor/ember/ember-template-compiler.js');

  const {Webpack} = require('@embroider/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTrees: true,
    staticAddonTestSupportTrees: true,
    staticHelpers: true,
    staticComponents: true,
    splitControllers: true,
    splitRouteClasses: true,
    // staticAppPaths: [],
    // splitAtRoutes: [],
    packagerOptions: {
      webpackConfig: {
        // this option might not be working?
        devtool: SOURCEMAPS ? 'eval-source-map' : 'none',
      }
    },
    // required due to this app being a dynamic component generator
    allowUnsafeDynamicComponents: true,
  });

  // return app.toTree();
};
