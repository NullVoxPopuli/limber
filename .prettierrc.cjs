'use strict';

module.exports = {
  printWidth: 100,
  tailwindStylesheet: './app/styles/app.css',
  plugins: ['prettier-plugin-ember-template-tag', 'prettier-plugin-tailwindcss'],
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
      files: ['*.hbs'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: ['*.gjs', '*.gts'],
      options: {
        parser: 'ember-template-tag',
        singleQuote: true,
        templateSingleQuote: false,
        trailingComma: 'es5',
      },
    },
  ],
};
