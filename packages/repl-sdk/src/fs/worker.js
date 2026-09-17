import { wrap } from 'comlink';

/**
 * @typedef {object} FsWorker
 * @property {(name: string, version: string) => Promise<import('../types.ts').InstalledPackage>} install
 * @property {() => Promise<Record<string, string[]>>} installed
 * @property {(name: string, version: string) => Promise<void>} link
 * @property {() => Promise<Record<string, string>>} links
 * @property {(path: string, text: string) => Promise<void>} write
 */

/** @type {undefined | FsWorker} */
let com;

/**
 * Lazily, because plenty of REPLs never download a package.
 *
 * @returns {FsWorker}
 */
export function fsWorker() {
  if (com) return com;

  const instance = new Worker(new URL('../fs-worker.js', import.meta.url), {
    name: 'repl-sdk file system',
    type: 'module',
  });

  com = /** @type {FsWorker} */ (/** @type {unknown} */ (wrap(instance)));

  return com;
}
