
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { findScenarios } from './commands/find-scenarios.js';
import { propagateLintConfiguration } from './commands/setup-lint-infra.js';
import { syncDeps } from './commands/sync-deps.js';
import { useUnstableEmbroider } from './commands/use-unstable-embroider.js';

let yarg = yargs(hideBin(process.argv));

yarg.wrap(yarg.terminalWidth());

yarg
  .command(
    'setup-lint-infra',
    'idempotently sets up lint infrastructure in existing and new projects',
    () => {},
    () => {
      return propagateLintConfiguration(true);
    }
  )
  .command(
    'use-unstable-embroider',
    'use the "main" and unstable release of embroider',
    () => {},
    () => {
      return useUnstableEmbroider();
    }
  )
  .command(
    'find-scenarios',
    'finds all ember-try scenarios in the project',
    () => {},
    async () => {
      let scenarios = await findScenarios();

      // eslint-disable-next-line no-console
      console.log(JSON.stringify(scenarios, null, 2));
    }
  )
  .command(
    'sync-deps <depName>',
    'updates a depenedncy to the latest version, if it exists.',
    (yargs) => {
      yargs.positional('depName', {
        description: 'The dep name to update',
        required: true,
      });
      yargs.option('force', {
        default: false,
        type: 'boolean',
        description: `add the dependency even if an older version isn't in the package.json`,
      });
      yargs.option('dev', {
        default: true,
        type: 'boolean',
        description: 'add the dep as a devDependency',
      });
      yargs.option('range', {
        default: '^',
        type: 'string',
        description: 'the range to use for the version. Defaults to ^. Can be ~, ^, or "pin"',
      });
    },
    syncDeps
  )
  .demandCommand()
  .help().argv;
