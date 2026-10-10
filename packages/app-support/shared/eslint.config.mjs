import { configs } from '@nullvoxpopuli/eslint-configs';

import templateLintMigration from 'eslint-plugin-ember/configs/template-lint-migration';

export default [
  ...configs.ember(import.meta.dirname),
  ...templateLintMigration,
];
