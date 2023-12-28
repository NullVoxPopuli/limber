'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const config = configs.ember();

module.exports = {
  ...config,
  overrides: [
    ...config.overrides,
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
