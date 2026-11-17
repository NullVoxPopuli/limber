/**
 * @typedef {import('../types.ts').Plugin} Plugin
 * @typedef {(id: string, parentUrl: string) => string} DefaultResolve
 */

import { installer } from '../fs/store.js';
import { deCDN } from '../utils.js';

/**
 * The `ember-addon.renamed-modules` of a pinned package, such as `@ember/*` from ember-source.
 * A module of a pinned package wins over a compiler's own resolve,
 * which is for hosts that bundle nothing.
 *
 * @param {() => DefaultResolve} defaultResolve the import map
 * @returns {Plugin}
 */
export function renamedModules(defaultResolve) {
  return {
    name: 'repl-sdk:renamed-modules',

    /**
     * Resolution of these is synchronous, so the package installs before anything imports it.
     */
    async buildStart({ versions }) {
      await Promise.all(
        Object.entries(versions).map(([name, range]) => installer.renameModules(name, range))
      );
    },

    resolveId(id, importer) {
      const vanilla = deCDN(id);

      if (!installer.isRenamed(vanilla)) return;

      return tryResolve(defaultResolve(), vanilla, importer);
    },
  };
}

/**
 * @param {DefaultResolve} resolve
 * @param {string} id
 * @param {string} parentUrl
 * @returns {string | undefined}
 */
export function tryResolve(resolve, id, parentUrl) {
  try {
    return resolve(id, parentUrl) || undefined;
  } catch {
    return undefined;
  }
}
