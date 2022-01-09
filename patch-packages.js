// @ts-check
'use strict';

const path = require('path');
const fs = require('fs/promises');

const modules = path.join(__dirname, 'node_modules');
const deps = require(path.join(__dirname, 'frontend/package.json'));

/**
  * These are patches to packages where things work for
  * this project, but I don't yet know what the proper way to fix the issue
  * for real is.
  */
async function start() {
  // await patchEmbroiderIssue1038();
}

async function patchEmbroiderIssue1038() {
  let isNeeded = has('ember-source', 'alpha') || has('ember-source', 'beta')
  if (!isNeeded) {
    return;
  }
  console.log('Patching @embroider/util due to https://github.com/embroider-build/embroider/issues/1038');

  let emberPrivateApi = path.join(modules, '@embroider/util/addon/ember-private-api.js');
  let fileBuffer = await fs.readFile(emberPrivateApi);
  let file = fileBuffer.toString();

  // the macro-condition for this file doesn't work because embroider can't find
  // ember-source.
  // since we know that
  file = file.replace(/macroCondition\(/, 'true || (');

  await fs.writeFile(emberPrivateApi, file);
}

function has(name, version) {
  let allDeps = { ...deps.dependencies, ...deps.devDependencies };

  return allDeps[name]?.includes(version);
}

start();
