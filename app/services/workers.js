import { action } from '@ember/object';
import Service from '@ember/service';

import { PWBHost } from 'promise-worker-bi';

export const HIGHLIGHTER_PATH = '/workers/highlighting';

export default class WorkersService extends Service {
  registry = {};

  @action
  getHighlighter() {
    return this.getWorker(HIGHLIGHTER_PATH);
  }

  getWorker(path) {
    if (this.registry[path]) return this.registry[path];

    let worker = new Worker(`${path}${window.ASSET_FINGERPRINT_HASH || ''}.js`);
    let promiseWorker = new PWBHost(worker);
    // promiseWorker._hostIDQueue = undefined;

    if (!promiseWorker) {
      throw new Error('failed to create promiseWorker?');
    }

    promiseWorker.register(function (message) {
      console.info(`Received message in ${path}: `, message);
    });

    promiseWorker.registerError(function (err) {
      console.error(`Error in ${path}: `, err);
    });

    this.registry[path] = promiseWorker;

    return this.registry[path];
  }

  willDestroy() {
    Object.values(this.registry).forEach((promiseWorker) => {
      promiseWorker._worker?.terminate();
    });
  }
}
