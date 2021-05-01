'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');
const {
  tsBase,
  baseRulesAppliedLast,
  moduleImports,
} = require('@nullvoxpopuli/eslint-configs/configs/base');
const { baseConfig: nodeCJS } = require('@nullvoxpopuli/eslint-configs/configs/node');

let config = configs.ember();

module.exports = {
  ...config,
  overrides: [
    ...config.overrides,
    {
      files: ['build.js', '*.config.js'],
      ...nodeCJS,
    },
    {
      ...tsBase,
      files: ['src/**/*.ts'],
      plugins: [tsBase.plugins, moduleImports.plugins].flat(),
      extends: [
        'eslint:recommended',
        'plugin:decorator-position/ember',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      rules: {
        ...tsBase.rules,
        ...moduleImports.rules,
        ...baseRulesAppliedLast,
      },
    },
  ],
};
