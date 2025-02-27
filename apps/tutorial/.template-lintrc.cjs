'use strict';

module.exports = {
  extends: 'recommended',
  ignore: ['public/docs/**/*'],
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
        // false negatives due to template-lint not being able to determine that
        // a calling context provides the label
        //
        // We'd rather disable than have template-lint-disables in the file...
        // lint disables look unprofessional
        'require-input-label': 'off',
      },
    },
  ],
};
