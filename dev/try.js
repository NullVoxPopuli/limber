import { execaCommand } from 'execa';

import { findScenarios } from './commands/find-scenarios.js';

let skip = 'limber-ui';
let results = [];
let errors = [];

let groups = await findScenarios();

for (let group of groups) {
  if (group.name.includes(skip)) continue;

  for (let scenario of group.scenarios) {
    console.info(`Running ${group.name} :: ${scenario}...`);

    try {
      await execaCommand('pnpm install --no-frozen-lockfile', { cwd: group.workspace });
      await execaCommand(`node_modules/.bin/ember try:one ${scenario} --- pnpm turbo run test`, {
        cwd: group.workspace,
      });

      results.push({ pass: 'yes', group: group.name, scenario });
    } catch (e) {
      errors.push(e);
      results.push({ pass: 'no', group: group.name, scenario });
    }
  }
}

// eslint-disable-next-line no-console
console.table(results);

if (errors.length) {
  errors.forEach((e) => console.error(e));
}

// eslint-disable-next-line n/no-process-exit
process.exit(errors.length);
