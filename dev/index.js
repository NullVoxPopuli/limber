import path from 'node:path';

import { project } from 'ember-apply';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { findScenarios } from './commands/find-scenarios.js';
import { symlinkEverywhere } from './commands/symlink-everywhere.js';

const yarg = yargs(hideBin(process.argv));

yarg.wrap(yarg.terminalWidth());

yarg
  .command(
    'setup-prettier',
    'symlink all the prettier/ignore files',
    () => {},
    async () => {
      const root = await project.gitRoot();
      const config = path.join(root, '.prettierrc.cjs');
      const ignore = path.join(root, '.prettierignore');
      const eslintIgnore = path.join(root, '.eslintignore');

      await symlinkEverywhere({ target: config, force: true });
      await symlinkEverywhere({ target: ignore, force: true });
      await symlinkEverywhere({ target: eslintIgnore, force: true });
    }
  )
  .command(
    'find-scenarios',
    'finds all ember-try scenarios in the project',
    () => {},
    async () => {
      const scenarios = await findScenarios();

      // eslint-disable-next-line no-console
      console.log(JSON.stringify(scenarios, null, 2));
    }
  )
  .demandCommand()
  .help().argv;
