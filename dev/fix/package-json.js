import path from 'node:path';

import { packageJson, project } from 'ember-apply';

let root = await project.gitRoot();

for await (let workspace of await project.getWorkspaces()) {
  if (workspace === root) continue;

  let relative = path.join(path.relative(workspace, root), 'package.json');
  let fromRoot = path.relative(root, workspace);

  await packageJson.modify((json) => {
    json.volta = {
      extends: relative,
    };
    json.repository = {
      type: 'git',
      url: 'https://github.com/NullVoxPopuli/limber.git',
      directory: fromRoot,
    };
    json.engines = {
      node: '>= v16',
      npm: 'use pnpm',
      yarn: 'use pnpm',
    };
    json.license = 'MIT';
    json.author = 'NullVoxPopuli';

    delete json.directories;
  }, workspace);
}
