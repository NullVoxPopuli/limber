/* eslint-disable no-process-exit */
/* eslint-disable no-console */
'use strict';
// https://github.com/emberjs/ember.js/blob/master/bin/run-browserstack-tests.js

const execa = require('execa');
const chalk = require('chalk');

function run(command, args = []) {
  console.log(chalk.dim('$ ' + command + ' ' + args.join(' ')));

  return execa(command, args, { stdio: 'inherit' });
}

(async function () {
  await run('ember', ['browserstack:connect']);

  try {
    try {
      // Calling testem directly here instead of `ember test` so that
      // we do not have to do a double build (by the time this is run
      // we have already ran `ember build`).
      await run('testem', [
        'ci',
        '-f',
        'browserstack.testem.js',
        '--host',
        '127.0.0.1',
        '--port',
        '7774',
      ]);

      console.log('success');
      process.exit(0);
    } finally {
      if (process.env.GITHUB_RUN_ID) {
        await run('ember', ['browserstack:results']);
      }

      await run('ember', ['browserstack:disconnect']);
    }
  } catch (error) {
    console.log('error');
    console.log(error);
    process.exit(1);
  }
})();
