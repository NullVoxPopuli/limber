import { PWBWorker } from 'promise-worker-bi';

import { compileGJS, compileHBS } from './formats.ts';
import { debug } from './log.ts';
import { getString } from './util.ts';

const promiseWorker = new PWBWorker();

promiseWorker.register(async (message) => {
  if (typeof message === 'object') {
    if (message !== null) {
      if ('command' in message) {
        return handleCommand(message);
      }
    }
  }

  debug(`unhandled message: ${JSON.stringify(message)}`);
});

async function handleCommand(message: { command: unknown }) {
  if (typeof message.command !== 'string') {
    debug(`unexpected command type: ${message.command}`);

    return;
  }

  switch (message.command) {
    case 'compile': {
      return compile(message);
    }

    default: {
      debug(`unexpected command: ${message.command}`);
    }
  }
}

/**
 * Returns a string of the compiled, browser-native JS
 * at this phase, we still need to:
 * - swap defined imports for the static values
 * - if not one of the static values, replace with the resolver function (requires top-level await)
 */
async function compile(message: NonNullable<object>) {
  let format = getString(message, 'format');

  if (!format) {
    debug(`format is required, received: ${format}`);
  }

  switch (format) {
    case 'gjs':
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return compileGJS(message);
    case 'hbs':
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return compileHBS(message);
    case 'glimdown':
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // TODO: Call out to markdown worker
      // @ts-ignore
      return compileGDM(message);
    default:
      debug(`Invalid format. Allowed: gjs, hbs, glimdown`);

      return;
  }
}
