'use strict';

module.exports = {
  // Personal preference
  printWidth: 100,

  // Default Ember (proposed)
  plugins: ['prettier-plugin-ember-template-tag'],
  overrides: [
    {
      files: '*.{js,ts,gjs,gts}',
      options: {
        singleQuote: true,
      },
    },
  ],
};
