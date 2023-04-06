'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  const { maybeEmbroider } = require('@embroider/test-setup');

  return maybeEmbroider(app, {
    // Embroider does not know how to resolve local helpers
    // https://github.com/embroider-build/embroider/issues/894
    staticHelpers: false,
    // Prevent the dummy app's components from getting removed
    staticComponents: false,

    packageRules: [
      {
        package: 'dummy',
        helpers: {
          '{{this.compile}}': { safeToIgnore: true },
        },
        components: {
          '{{this.compile}}': { safeToIgnore: true },
        },
      },
    ],
    packagerOptions: {
      webpackConfig: {
        // can't read default eval stuff in the output...
        devtool: false,
        node: {
          global: false,
          __filename: true,
          __dirname: true,
        },
        resolve: {
          fallback: {
            path: 'path-browserify',
          },
        },
      },
    },
  });
};
