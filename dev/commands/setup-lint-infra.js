import { ember, packageJson, project } from 'ember-apply';

import { symlinkEverywhere } from './symlink-everywhere.js';
import { latestOfAll } from './utils.js';

export async function propagateLintConfiguration(force = false) {
  /************************************
   * Symlink configs and ignore files
   **********************************/
  await symlinkEverywhere({ target: '.prettierrc.cjs', force });
  await symlinkEverywhere({ target: '.prettierignore', force });
  // await symlinkEverywhere({ target: '.eslintignore', force });

  /************************************
   * Ensure scripts accomodate what we need them to
   * - This is in-part because prettier does not by default check every file type
   *   you need to tell it to do so
   *
   * ESLint lints files based on `overrides`, rather than the input pattern here
   * (very easy to add support for additional file types)
   **********************************/
  await fixLintScripts();
}

async function fixLintScripts() {
  let root = await project.gitRoot();

  for await (let workspace of await project.eachWorkspace()) {
    if (workspace === root) continue;

    let hasGlint = await packageJson.hasDependency('@glint/core');
    let hasTypeScript = await packageJson.hasDependency('@glint/core');
    let isEmber = await ember.isEmberProject();

    await packageJson.addDevDependencies(
      await latestOfAll([
        'prettier',
        'eslint',
        'prettier-plugin-ember-template-tag',
        '@nullvoxpopuli/eslint-configs',
        ...(isEmber ? ['ember-template-lint', 'eslint-plugin-ember'] : []),
        ...(hasTypeScript ? ['@typescript-eslint/eslint-plugin', '@typescript-eslint/parser'] : []),
      ]),
      workspace
    );

    await packageJson.modify((json) => {
      if (!json.scripts) return;

      delete json.scripts['_:lint:types'];
      delete json.scripts['_:lint:js'];
      delete json.scripts['_:lint:js:fix'];
      delete json.scripts['_:lint:prettier'];
      delete json.scripts['_:lint:prettier:fix'];
      delete json.scripts['_:lint:hbs'];
      delete json.scripts['_:lint:hbs:fix'];
    }, workspace);

    await packageJson.addScripts(
      {
        lint: 'pnpm -w exec lint',
        'lint:fix': 'pnpm -w exec lint fix',
        'lint:js': 'pnpm -w exec lint js',
        'lint:js:fix': 'pnpm -w exec lint js:fix',
        ...(isEmber
          ? {
              'lint:hbs': 'pnpm -w exec lint hbs',
              'lint:hbs:fix': 'pnpm -w exec lint hbs:fix',
            }
          : {}),
        'lint:prettier:fix': 'pnpm -w exec lint prettier:fix',
        'lint:prettier': 'pnpm -w exec lint prettier',
        ...(hasGlint
          ? {
              'lint:types': 'glint',
            }
          : {}),
      },
      workspace
    );
  }
}
