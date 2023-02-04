'use strict';

module.exports = {
  singleQuote: true,
  templateSingleQuote: false,
  printWidth: 100,
  overrides: [
    {
      files: ['**/*.gjs', '**/*.gts'],
      plugins: ['prettier-plugin-ember-template-tag'],
    }
  ]
};
