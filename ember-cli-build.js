'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const { SOURCEMAPS: _sourceMaps, CLASSIC } = process.env;

const SOURCEMAPS = _sourceMaps === 'true'; // default false

module.exports = function (defaults) {
  console.info(`
    Building:
      SOURCEMAPS: ${SOURCEMAPS}
      CLASSIC: ${CLASSIC}
  `);

  let config = {
    babel: {
      // enables dynamic imports
      // plugins: [require.resolve('ember-auto-import/babel-plugin')],
    },
    sourcemaps: {
      enabled: SOURCEMAPS,
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
    config.autoImport = {
      alias: {
        // when the app tries to import from "plotly.js", use
        // the real package "plotly.js-basic-dist" instead.
        // '@ember/template-compiler': 'vendor/ember/ember-template-compiler.js',
      },
    };
  }

  let app = new EmberApp(defaults, config);

  app.import('vendor/ember/ember-template-compiler.js');

  if (CLASSIC) {
    return app.toTree();
  }

  const { Webpack } = require('@embroider/webpack');

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
      },
    },
    // required due to this app being a dynamic component generator
    allowUnsafeDynamicComponents: true,
  });
};
