#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import chalk from 'chalk';
import { execa, execaCommand } from 'execa';

const root = path.join(import.meta.dirname, '../../');

async function readPackageJSON(cwd) {
  const pPath = path.join(cwd, 'package.json');
  const buffer = fs.readFile(pPath);

  return JSON.stringify(buffer.toString());
}

const [, , command, ...userArgs] = process.argv;
// process.cwd() is whatever pnpm decides to do
//
// For now, we use INIT_CWD, because we want to use
// whatever the User's CWD is, even if we are invoked via
// pnpm -w exec, which is "workspace root"
//
// Other options:
//  PNPM_SCRIPT_SRC_DIR
//  OLDPWD
const cwd = process.env['INIT_CWD'];

const manifest = await readPackageJSON(cwd);
const relative = path.relative(root, cwd);

if (process.env['DEBUG']) {
  console.debug(`${manifest.name} :: within ${relative}`);
}

// Prettier is not using overrides to discover file extensions to check
// like ESLint does.
// See: https://github.com/gitKrystan/prettier-plugin-ember-template-tag/issues/113
const fileExtGlob = `**/*.{gjs,gts,hbs,json,js,ts,gjs,mjs,cts,mts,cts}`;

async function run() {
  switch (command) {
    case 'prettier:fix':
      return exec(`pnpm prettier -w "${fileExtGlob}" --cache --cache-strategy content`);
    case 'prettier':
      return exec(`pnpm prettier -c ${fileExtGlob}`);
    case 'js:fix':
      return exec(`pnpm eslint . ` + `--fix --cache --cache-strategy content`);
    case 'js':
      return exec(`pnpm eslint . `);
    case 'hbs:fix':
      return exec(`pnpm ember-template-lint . --fix --no-error-on-unmatched-pattern`);
    case 'hbs':
      return exec(`pnpm ember-template-lint . --no-error-on-unmatched-pattern`);
    case 'fix':
      return turbo('_:lint:fix');
    default:
      return turbo('_:lint');
  }
}

function exec(command) {
  if (userArgs.length) {
    command += ` ${userArgs.join(' ')}`;
  }

  console.info(chalk.blueBright('Running:\n', command));

  return execaCommand(command, { cwd, stdio: 'inherit' });
}

function turbo(cmd) {
  let filterArgs = [];

  if (cwd !== root) {
    filterArgs = ['--filter', manifest.name];
  }

  const args = [
    'turbo',
    '--color',
    '--no-update-notifier',
    //'--output-logs',
    //'errors-only',
    ...filterArgs,
    cmd,
    ...userArgs,
  ];

  console.info(chalk.blueBright('Running:\n', args.join(' ')));

  return execa('pnpm', args, { stdio: 'inherit', env: { FORCE_COLOR: '1' } });
}

async function dumpErrorLog(e) {
  function generateRandomName() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);

    return `file_${timestamp}_${random}.log`;
  }

  try {
    const randomName = await generateRandomName();
    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, randomName);

    const content =
      `\n` +
      new Date() +
      '\n' +
      e.message +
      '\n\n' +
      '====================================================' +
      '\n\n' +
      e.stack;

    await fs.writeFile(filePath, content);

    console.error(chalk.red('Error log at ', filePath));
  } catch (err) {
    console.error(chalk.red('Error creating file:', err));
  }
}

try {
  await run();
} catch (e) {
  await dumpErrorLog(e);
  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
}
