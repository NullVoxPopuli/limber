/**
 * @typedef {import('../types.ts').Plugin} Plugin
 */

import { secretKey } from '../cache.js';
import { parseVirtualUrl, virtualUrl } from '../fs/url.js';
import { virtualModuleSource } from '../fs/virtual.js';
import { assert, deCDN } from '../utils.js';

/**
 * Modules that the host bundles, from the `resolve` option.
 *
 * @param {{ [importPath: string]: unknown } | undefined} modules
 * @param {(name: string) => Promise<object | undefined>} resolveManually
 * @returns {Plugin}
 */
export function providedModules(modules, resolveManually) {
  return {
    name: 'repl-sdk:provided',

    resolveId(id) {
      const vanilla = deCDN(id);

      if (!modules?.[vanilla]) return;

      return virtualUrl('manual', vanilla);
    },

    async load(id) {
      const virtual = parseVirtualUrl(id);

      if (virtual?.kind !== 'manual') return;

      const result = await resolveManually(virtual.name);

      assert(`Failed to resolve ${virtual.name}`, result);

      return virtualModuleSource(virtual.name, result, secretKey);
    },
  };
}
