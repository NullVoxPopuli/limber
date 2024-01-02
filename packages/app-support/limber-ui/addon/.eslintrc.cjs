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
      extends: ['eslint:recommended', 'plugin:ember/recommended', 'plugin:ember/recommended-gts'],
    },
    {
      files: ['**/*.gjs'],
      parser: 'ember-eslint-parser',
      extends: ['eslint:recommended', 'plugin:ember/recommended', 'plugin:ember/recommended-gjs'],
    },
  ],
};
