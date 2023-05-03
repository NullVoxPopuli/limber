import path from 'node:path';

import { packageJson, project } from 'ember-apply';
import fse from 'fs-extra';

export async function findScenarios() {
  let result = [];

  for await (let workspace of await project.eachWorkspace()) {
    let config = await emberTry(workspace);

    if (!config) continue;

    let pkg = await packageJson.read(workspace);
    let module = await import(config);

    let name = pkg.name;
    let evaluatedConfig = await module.default();

    result.push({
      name,
      workspace,
      scenarios: evaluatedConfig.scenarios.map((scenario) => scenario.name),
    });
  }

  return result;
}

async function emberTry(workspace) {
  let a = path.join(workspace, 'config/ember-try.js');
  let b = path.join(workspace, 'tests/dummy/config/ember-try.js');

  if (await fse.pathExists(a)) {
    return a;
  }

  if (await fse.pathExists(b)) {
    return b;
  }
}
