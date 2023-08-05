'use strict';

module.exports = {
  printWidth: 100,
  overrides: [
    {
      // Lol, JavaScript
      files: ['*.js', '*.ts', '*.cjs', '.mjs', '.cts', '.mts', '.cts'],
      options: {
        singleQuote: true,
        trailingComma: 'es5',
      },
    },
    {
      files: ['*.json'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: ['**/*.hbs'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: ['**/*.gjs', '**/*.gts'],
      options: {
        singleQuote: true,
        trailingComma: 'es5',
      },
      plugins: ['prettier-plugin-ember-template-tag'],
    },
  ],
};
