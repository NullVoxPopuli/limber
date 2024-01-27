'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const config = configs.ember();

module.exports = {
  ...config,
  overrides: [
    ...config.overrides,
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
    {
      files: ['app/components/prose/prose-not-found.gts'],
      rules: {
        // https://github.com/NullVoxPopuli/ember-eslint-parser/pull/35
        'padding-line-between-statements': 'off',
      },
    },
  ],
};
