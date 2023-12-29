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
      plugins: ['ember'],
      parser: 'ember-eslint-parser',
    },
    {
      files: ['**/*.gjs'],
      plugins: ['ember'],
      parser: 'ember-eslint-parser',
    },
  ],
};
