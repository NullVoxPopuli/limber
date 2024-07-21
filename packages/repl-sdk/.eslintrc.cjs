'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

// accommodates: JS, TS, App, and Addon
const config = configs.ember();

module.exports = {
  ...config,
  overrides: [
    ...config.overrides,
    {
      files: ['example/**'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2023,
      },
    },
    {
      files: ['src/index.js'],
      globals: {
        importShim: true,
      },
    },
    {
      files: ['src/types.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
