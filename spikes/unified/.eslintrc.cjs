'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const config = configs.crossPlatform();

module.exports = {
  ...config,
  env: {
    browser: true
  },
  overrides: [...config.overrides],
};
