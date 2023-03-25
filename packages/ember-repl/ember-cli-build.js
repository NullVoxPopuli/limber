'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
    autoImport: {
      forbidEval: true,
    },
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

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
