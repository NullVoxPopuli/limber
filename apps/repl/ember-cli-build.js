'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = async function (defaults) {
  // ESM-only dependencies
  const { default: yn } = await import('yn');

  let environment = EmberApp.env();
  let isProduction = environment === 'production';

  let MINIFY = yn(process.env.MINIFY) ?? isProduction;

  console.info(`
    Building:
      MINIFY: ${MINIFY}
      NODE_ENV: ${process.env.NODE_ENV}

      isProduction: ${isProduction}
  `);

  let app = new EmberApp(defaults, {
    /* defaults */
  });

  // Adds:
  //  - ember-template-compiler
  //  - @glimmer/syntax
  app.import('vendor/ember/ember-template-compiler.js');

  const Compat = require('@embroider/compat');

  return Compat.prebuild(app, {
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    staticEmberSource: true,
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    allowUnsafeDynamicComponents: true,
  });
};
