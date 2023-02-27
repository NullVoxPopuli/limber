#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { symlinkEverywhere } from './commands/symlink-everywhere.js';
import { syncDeps } from './commands/sync-deps.js';


let yarg = yargs(hideBin(process.argv));

yarg.wrap(yarg.terminalWidth());

yarg
  .command(
    'symlink-everywhere <target>',
      'symlinks a target file in to each workspace. Useful for propagating lint configs / ignore files',
    (yargs) => {
      return yargs.positional('target', {
        description: 'The file to symlink',
        required: true,
      });
    },
    symlinkEverywhere
  )
.command('sync-prettier', 'symlinks all workspaces to use the same prettier config', () => {}, () => {
  return symlinkEverywhere({ target: '.prettierrc.cjs' });
})
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
      description: `add the dependency even if an older version isn't in the package.json`
    });
    yargs.option('dev', {
      default: true,
      type: 'boolean',
      description: 'add the dep as a devDependency',
    });
    yargs.option('range', {
      default: '^',
      type: 'string',
      description: 'the range to use for the version. Defaults to ^. Can be ~, ^, or "pin"'
    })
  },
  syncDeps,
)
  .demandCommand()
  .help().argv;
