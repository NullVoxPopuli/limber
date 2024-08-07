'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const path = require('path');

module.exports = function (defaults) {
  const sideWatch = require('@embroider/broccoli-side-watch');

  const app = new EmberApp(defaults, {
    // Add options here
    trees: {
      app: sideWatch('app', { watching: [path.join(__dirname, '../addon/dist')] }),
    },
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
    name: 'test-app',
    autoImport: {
      watchDependencies: Object.keys(require('./package.json').dependencies),
    },
  });

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
            buffer: require.resolve('buffer/'),
          },
        },
      },
    },
  });
};
