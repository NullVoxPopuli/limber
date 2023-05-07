import { ember,packageJson, project } from 'ember-apply';
import latestVersion from 'latest-version';

import { symlinkEverywhere } from './symlink-everywhere.js';

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
      workspace);

    await packageJson.modify(json => {
      delete json.scripts['lint:js'];
      delete json.scripts['lint:js:fix'];
      delete json.scripts['lint:prettier'];
      delete json.scripts['lint:prettier:fix'];
      delete json.scripts['lint:hbs'];
      delete json.scripts['lint:hbs:fix'];
    }, workspace);

    await packageJson.addScripts({
      lint: "pnpm -w exec lint",
      "lint:fix": "pnpm -w exec lint fix",
      "_:lint:js": "pnpm -w exec lint js",
      "_:lint:js:fix": "pnpm -w exec lint js:fix",
      ...(isEmber ? {
        "_:lint:hbs": "pnpm -w exec lint hbs",
        "_:lint:hbs:fix": "pnpm -w exec lint hbs:fix",
      } : {}),
      "_:lint:prettier:fix": "pnpm -w exec lint prettier:fix",
      "_:lint:prettier": "pnpm -w exec lint prettier",
      ...(hasGlint ? {
        '_:lint:types': 'glint',
      } : {})
    }, workspace);
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

