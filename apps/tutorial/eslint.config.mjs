import { configs } from '@nullvoxpopuli/eslint-configs';

const config = configs.ember(import.meta.dirname, { templates: true });

export default [
  ...config,
  {
    files: ['**/*.{gjs,gts}'],
    rules: {
      // We do what we want. psh
      'ember/template-no-forbidden-elements': 'off',
      'ember/template-no-inline-styles': 'off',
    },
  },
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
