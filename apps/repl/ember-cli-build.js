'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { prebuild } = require('@embroider/compat');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
      
  });

  return prebuild(app);
};
