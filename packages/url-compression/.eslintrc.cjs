'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const config = configs.ember();

module.exports = {
  ...config,
  overrides: [
    ...config.overrides,
    {
      files: ['build.js'],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        'n/no-unsupported-features': 'off',
      },
    },
  ],
};
