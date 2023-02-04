#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { symlinkEverywhere } from './commands/symlink-everywhere.js';


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
  .demandCommand()
  .help().argv;
