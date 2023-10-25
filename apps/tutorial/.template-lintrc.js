'use strict';

module.exports = {
  extends: 'recommended',
  ignore: ['docs/**/*'],
  overrides: [
    {
      files: ['**/*.gts', '**/*.gjs'],
      rules: {
        // Handled by ESLint
        //   otherwise gives false negatives
        'no-implicit-this': 'off',
        // false negatives due to being defined in js-scope
        'no-curly-component-invocation': 'off',
        // We do what we want. psh
        'no-forbidden-elements': 'off',
        'no-inline-styles': 'off',
      },
    },
  ],
};
