import { configs } from '@nullvoxpopuli/eslint-configs';

const config = configs.ember(import.meta.dirname);

export default [
  ...config,
  // your modifications here
  // see: https://eslint.org/docs/user-guide/configuring/configuration-files#how-do-overrides-work
  {
    // ...baseNode,
    files: ['browserstack.testem.js'],
  },
  {
    files: ['**/*'],
    rules: {
      // This rule is just wrong
      // param?: X | undefined is meaningful (passing, but has undefined value)
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      // This rule is disabled, because this lint doesn't understand that
      //  "".split('|')[0] is a string
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Debt During Update, maybe
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'import/no-unassigned-import': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'ember/template-no-let-reference': 'off',
    },
  },
];
