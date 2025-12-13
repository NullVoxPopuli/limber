// eslint.config.js
// eslint-disable-next-line n/no-extraneous-import
import { configs } from '@nullvoxpopuli/eslint-configs';

// accommodates: JS, TS, App, Addon, and V2 Addon
export default [
  ...configs.ember(import.meta.dirname),
  {
    name: 'local:tech-debt',
    files: ['**/*'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
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
    },
  },
  {
    files: ['config/**', 'vite.config.*', 'eslint.config.*'],
    rules: {
      'n/no-unpublished-import': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },
];
