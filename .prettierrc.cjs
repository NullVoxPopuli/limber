'use strict';

module.exports = {
  singleQuote: true,
  printWidth: 100,
  plugins: ['prettier-plugin-ember-template-tag'],
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
