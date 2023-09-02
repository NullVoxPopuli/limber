'use strict';

const fs = require('fs');
const path = require('path');

function ref() {
  const rev = fs.readFileSync(path.join(__dirname, '../../../.git/HEAD')).toString().trim();

  if (rev.indexOf(':') === -1) {
    return rev;
  } else {
    return fs
      .readFileSync(path.join(__dirname, '../../../.git/' + rev.substring(5)))
      .toString()
      .trim();
  }
}

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'limber',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },

    APP: {
      version: `REPL :: ${ref()} :: ${new Date()}`,
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    'ember-shiki': {
      defaultLanguages: ['gjs', 'gts', 'css', 'bash', 'js', 'ts', 'markdown'],
      defaultThemes: ['one-dark-pro'],
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
