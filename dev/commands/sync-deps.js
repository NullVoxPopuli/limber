import assert from 'node:assert';

import chalk from 'chalk';
import { packageJson, project } from 'ember-apply';
import latestVersion from 'latest-version';

/**
 * @param {{
 *   depName: string,
 *   force: boolean,
 *   dev: boolean,
 *   range: '^' | '~' | 'pin'
 * }} options}
 */
export async function syncDeps(options) {
  assert(options.depName, 'depName is required');
  assert(['^', '~', 'pin'].includes(options.range), `range must be one of ^, ~, or "pin"`);

  let latest = await latestVersion(options.depName);
  let version = latest;

  if (options.range != 'pin') {
    version = `${options.range}${version}`;
  }

  console.info(
    chalk.dim(
      `Applying ${options.depName}@${version} to workspaces as a ${
        options.dev ? 'devDependency' : 'dependency'
      }`
    )
  );

  let changedWorkspaces = [];

  for await (let workspace of await project.eachWorkspace()) {
    await project.inWorkspace(workspace, async () => {
      let { name } = await packageJson.read();

      if (!options.force) {
        let hasDep = await packageJson.hasDependency(options.depName);

        if (!hasDep) {
          return;
        }
      }

      changedWorkspaces.push(name);

      if (options.dev) {
        await packageJson.addDevDependencies({
          [options.depName]: version,
        });

        return;
      }

      await packageJson.addDependencies({
        [options.depName]: version,
      });
    });
  }

  console.info(chalk.green('Success!'));
  console.info('Affected workspaces:');
  console.info(changedWorkspaces);
}
