'use strict';

module.exports = {
  plugins: [],
  extends: ['recommended'],
  overrides: [
    {
      files: ['**/*.gts', '**/*.gjs'],
      rules: {
        // Handled by ESLint
        //   otherwise gives false negatives
        'no-implicit-this': 'off',
      },
    },
  ],
};
