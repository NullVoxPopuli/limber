import path from 'node:path';

import { packageJson, project } from 'ember-apply';
import fse from 'fs-extra';

export async function findScenarios() {
  const result = [];

  for await (const workspace of await project.eachWorkspace()) {
    const config = await emberTry(workspace);

    if (!config) continue;

    const pkg = await packageJson.read(workspace);
    const module = await import(config);

    const name = pkg.name;
    const evaluatedConfig = await module.default();

    result.push({
      name,
      workspace,
      scenarios: evaluatedConfig.scenarios.map((scenario) => scenario.name),
    });
  }

  return result;
}

async function emberTry(workspace) {
  const a = path.join(workspace, 'config/ember-try.js');
  const b = path.join(workspace, 'tests/dummy/config/ember-try.js');

  if (await fse.pathExists(a)) {
    return a;
  }

  if (await fse.pathExists(b)) {
    return b;
  }
}
