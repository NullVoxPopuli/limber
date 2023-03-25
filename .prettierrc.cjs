'use strict';

module.exports = {
  singleQuote: true,
  printWidth: 100,
  // templateSingleQuote: false,
  overrides: [
    {
      files: ['**/*.hbs'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: ['**/*.gjs', '**/*.gts'],
      plugins: ['prettier-plugin-ember-template-tag'],
    },
  ],
};
