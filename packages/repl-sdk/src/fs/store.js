import { takeEntry } from './entry.js';
import { Installer } from './install.js';
import { Storage } from './storage.js';
import { pathOf, typeFor } from './url.js';
import { fsWorker } from './worker.js';

/**
 * One fs per page, not one per Compiler.
 *
 * es-module-shims keys its module registry by URL globally, so a second
 * Compiler importing the same specifier gets the already-instantiated module
 * and its source hook is never called. A per-instance fs would look empty in
 * exactly that case, and the two would disagree about what is installed.
 *
 * Reads happen here, on the main thread. Writes go through the worker.
 */
export const storage = new Storage();

export const installer = new Installer({
  worker: {
    install: (name, version) => fsWorker().install(name, version),
    installed: () => fsWorker().installed(),
    link: (name, version) => fsWorker().link(name, version),
    links: () => fsWorker().links(),
  },
});

/**
 * Forgets what this page resolved. The files stay, so the next install of the
 * same version reads them instead of downloading them.
 */
export function clearFs() {
  installer.clear();
}

/**
 * The es-module-shims `source` hook.
 *
 * Async on purpose. This is what lets `resolve` stay dumb: anything the
 * installer missed can still be fetched here, without having to hand out an
 * opaque placeholder URL from a synchronous resolve first.
 *
 * @param {Storage} files
 * @param {Installer} installs
 */
export function createSourceHook(files, installs) {
  /**
   * @param {string} url
   * @param {RequestInit} fetchOpts
   * @param {string} parent
   * @param {(url: string, fetchOpts: RequestInit, parent: string) => Promise<any>} defaultSourceHook
   */
  return async function source(url, fetchOpts, parent, defaultSourceHook) {
    /**
     * Hot reloading appends ?v={n}. The registry key keeps it, the fs doesn't.
     */
    const path = url.replace(/\?v=\d+$/, '');
    const real = (await installs.resolveUrl(path)) ?? path;
    const text = takeEntry(url) ?? (await files.read(pathOf(real)));

    if (text !== undefined) {
      return { url: real === path ? url : real, type: typeFor(real), source: text };
    }

    return defaultSourceHook(url, fetchOpts, parent);
  };
}
