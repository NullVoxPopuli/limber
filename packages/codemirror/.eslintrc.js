'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');
const {
  tsBase,
  baseRulesAppliedLast,
  moduleImports,
} = require('@nullvoxpopuli/eslint-configs/configs/base');

let config = configs.node();

module.exports = {
  ...config,
  overrides: [
    ...config.overrides,
    {
      files: ['preconfigured/**/*.ts'],
      ...tsBase,
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
