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
        // Incorrect, because it matches anything that looks like an arg, even if it's a string (intentionally)
        'no-potential-path-strings': 'off',
      },
    },
    {
      files: ['**/languages.gts'],
      rules: {
        'no-triple-curlies': 'off',
        'no-inline-styles': 'off',
      },
    },
  ],
};
