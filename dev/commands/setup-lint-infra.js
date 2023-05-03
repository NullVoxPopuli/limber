import { project, packageJson, ember } from 'ember-apply';

import { symlinkEverywhere } from './symlink-everywhere.js';

const LINT_EXTENSIONS = ['js', 'ts', 'gjs','gts', 'hbs'];
const LINT_GLOB = `**/*.{${LINT_EXTENSIONS.join(',')}}`

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
      "@nullvoxpopuli/eslint-configs",
        ...(isEmber ? ['ember-template-lint', 'eslint-plugin-ember'] : []),
        ...(hasTypeScript ? ['@typescript-eslint/eslint-plugin', '@typescript-eslint/parser'] : []),
      ])
    );

    /**
      * Check: no cache
      * Fix:  use cache
      */
    await packageJson.addScripts({
      "lint": "pnpm turbo lint --output-logs errors-only",
      "lint:fix": "concurrently 'npm:lint:*:fix' --names 'fix:'",

      // Conditional scripts
      ...(hasGlint ? {
        "lint:types": "glint",
      }: {}),

      ...(isEmber ? {
        "lint:hbs": "ember-template-lint . --no-error-on-unmatched-pattern",
        "lint:hbs:fix": "ember-template-lint . --fix --no-error-on-unmatched-pattern",
      } : {}),

      // We always need these
      "lint:js:fix": "eslint . --fix",
      "lint:js": "eslint . --cache --cache-strategy content",
      "lint:prettier:fix": `prettier --cache --cache-strategy content -w ${LINT_GLOB}`,
      "lint:prettier": `prettier -c ${LINT_GLOB}`,
    });
  }
}

const VERSION_CACHE = new Map();

async function versionFor(name) {
  if (VERSION_CACHE.has(name)) {
    return VERSION_CACHE.get(name);
  }

  let version = await latestVersion(name);

  VERSION_CACHE.set(name, version);

  return version;
}

async function lastestOfAll(dependencies) {
  let result = {};

  let promises = dependencies.map(async (dep) => {
    return [dep, await versionFor(dep)];
  });

  let resolved = await Promise.all(promises);

  for (let [dep, version] of resolved) {
    result[dep] = `^${version}`;
  }

  return result;
}

