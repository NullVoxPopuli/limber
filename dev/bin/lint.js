#!/usr/bin/env node
import path from 'node:path';

import { packageJson, project } from 'ember-apply';
import { execaCommand } from 'execa';

const [, , command] = process.argv;
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

const root = await project.gitRoot();
const manifest = await packageJson.read(cwd);
const relative = path.relative(root, cwd);

const LINT_EXTENSIONS = ['js', 'ts', 'gjs', 'gts', 'hbs', 'css'];
const LINT_GLOB = `**/*.{${LINT_EXTENSIONS.join(',')}}`;

console.debug(`${manifest.name} :: within ${relative}`);

/**
 * Check: no cache
 * Fix:  use cache
 */
async function run() {
  switch (command) {
    case 'prettier:fix':
      return execaCommand(
        `pnpm prettier -w ${LINT_GLOB} --cache --cache-strategy content --config ./.prettierrc.cjs`,
        {
          cwd,
          stdio: 'inherit',
        }
      );
    case 'prettier':
      return execaCommand(`pnpm prettier -c ${LINT_GLOB} --config ./.prettierrc.cjs`, {
        cwd,
        stdio: 'inherit',
      });
    case 'js:fix':
      return execaCommand(`pnpm eslint . --fix --cache --cache-strategy content`, {
        cwd,
        stdio: 'inherit',
      });
    case 'hbs':
      return execaCommand(`pnpm ember-template-lint . --no-error-on-unmatched-pattern`, {
        cwd,
        stdio: 'inherit',
      });
    // template-lint has no cache
    case 'hbs:fix':
      return execaCommand(`pnpm ember-template-lint . --fix --no-error-on-unmatched-pattern`, {
        cwd,
        stdio: 'inherit',
      });
    case 'js':
      return execaCommand(`pnpm eslint .`, { cwd, stdio: 'inherit' });
    case 'fix':
      return execaCommand(`pnpm turbo _:lint:fix`, { cwd, stdio: 'inherit' });
    default:
      return execaCommand(`pnpm turbo _:lint`, { cwd, stdio: 'inherit' });
  }
}

await run();
