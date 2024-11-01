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
        // false negatives due to being defined in js-scope
        'no-curly-component-invocation': 'off',
        // Don't care
        'no-forbidden-elements': 'off',
      },
    },
  ],
};
