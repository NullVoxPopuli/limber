import path from 'node:path';

import { packageJson, project } from 'ember-apply';
import fse from 'fs-extra';
import latestVersion from 'latest-version';

let root = await project.gitRoot();

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

for await (let workspace of await project.getWorkspaces()) {
  if (workspace === root) continue;

  await packageJson.removeDevDependencies(['eslint-plugin-prettier']);

  await packageJson.addDevDependencies(
    await lastestOfAll([
      '@babel/core',
      '@babel/eslint-parser',
      '@nullvoxpopuli/eslint-configs',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'eslint',
      'prettier',
      'typescript',
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
      'lint:prettier:fix': 'pnpm -w exec lint prettier:fix',
      'lint:prettier': 'pnpm -w exec lint prettier',
    },
    workspace
  );

  let configPath = path.join(workspace, '.eslintrc.cjs');
  let hasConfig = await fse.pathExists(configPath);

  if (!hasConfig) {
    await fse.writeFile(
      configPath,
      `'use strict';\n\n` +
        `const { configs } = require('@nullvoxpopuli/eslint-configs');\n\n` +
        `module.exports = configs.crossPlatform();\n`
    );
  }
}
