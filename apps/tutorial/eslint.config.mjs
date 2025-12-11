import { configs } from '@nullvoxpopuli/eslint-configs';

// eslint-disable-next-line n/no-unsupported-features/node-builtins
const config = configs.ember(import.meta.dirname);

export default [
  ...config,
  {
    files: ['app/components/prose/prose-not-found.gts'],
    rules: {
      // https://github.com/NullVoxPopuli/ember-eslint-parser/pull/35
      'padding-line-between-statements': 'off',
    },
  },
  {
    files: ['**/*'],
    rules: {
      'import/no-unassigned-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    ignores: ['public/**/*'],
  },
];
