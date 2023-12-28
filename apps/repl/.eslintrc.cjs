'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');
const { baseConfig: baseNode } = require('@nullvoxpopuli/eslint-configs/configs/node');

const config = configs.ember();

module.exports = {
  ...config,
  overrides: [
    ...config.overrides,
    {
      ...baseNode,
      files: ['browserstack.testem.js'],
    },
    {
      files: ['**/*.gts'],
      parser: 'ember-eslint-parser',
    },
    {
      files: ['**/*.gjs'],
      parser: 'ember-eslint-parser',
    },
  ],
};
