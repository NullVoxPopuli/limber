'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const config = configs.nodeES();

module.exports = {
  ...config,
  overrides: [...config.overrides],
};
