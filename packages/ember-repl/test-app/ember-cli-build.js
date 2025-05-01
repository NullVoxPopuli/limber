'use strict';;
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const path = require('path');

const {
  compatBuild
} = require("@embroider/compat");

module.exports = async function(defaults) {
  const {
    buildOnce
  } = await import("@embroider/vite");

  const sideWatch = require('@embroider/broccoli-side-watch');

  const app = new EmberApp(defaults, {
    // Add options here
    trees: {
      app: sideWatch('app', { watching: [path.join(__dirname, '../addon/dist')] }),
    },
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
    name: 'ember-repl-test-app',
    autoImport: {
      watchDependencies: Object.keys(require('./package.json').dependencies),
    },
  });

  app.import('vendor/ember/ember-template-compiler.js');

  const { maybeEmbroider } = require('@embroider/test-setup');

  return compatBuild(app, buildOnce);
};
