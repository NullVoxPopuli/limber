'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

let config = configs.crossPlatform();

module.exports = {
  ...config,
  overrides: [...config.overrides],
};
