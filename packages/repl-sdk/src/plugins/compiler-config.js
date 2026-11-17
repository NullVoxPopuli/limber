/**
 * @typedef {import('../types.ts').Plugin} Plugin
 * @typedef {import('../types.ts').CompilerConfig} CompilerConfig
 * @typedef {import('../types.ts').Compiler} Compiler
 */

import { cache, secretKey } from '../cache.js';
import { installer } from '../fs/store.js';
import { extensionOf, NODE_MODULES_PREFIX, parseVirtualUrl, virtualUrl } from '../fs/url.js';
import { virtualModuleSource } from '../fs/virtual.js';
import { assert, deCDN } from '../utils.js';

/**
 * The `resolve` of a compiler config.
 *
 * @param {NonNullable<CompilerConfig['resolve']>} resolve
 * @returns {Plugin}
 */
export function fromConfigResolve(resolve) {
  /**
   * @type {Map<string, () => Record<string, unknown> | Promise<Record<string, unknown>>>}
   */
  const loaders = new Map();

  return {
    name: 'repl-sdk:compiler-config-resolve',

    resolveId(id, _importer, { versions }) {
      /**
       * Once the page pins a framework from npm, its addons come from npm too, so they match it.
       */
      if (installer.hasRenamedModules) return;

      const vanilla = deCDN(id);
      const result = resolve(vanilla, versions);

      if (!result) return;

      if (typeof result === 'function') {
        loaders.set(vanilla, result);

        return virtualUrl('configured', vanilla);
      }

      return result;
    },

    async load(id) {
      const virtual = parseVirtualUrl(id);

      if (virtual?.kind !== 'configured') return;

      const loader = loaders.get(virtual.name);

      if (!loader) return;

      const result = await loader();

      assert(`Failed to resolve ${virtual.name}`, result);
      cache.resolves[virtual.name] = result;

      return virtualModuleSource(virtual.name, result, secretKey);
    },
  };
}

/**
 * The `handlers` of a compiler, which change files from npm by extension.
 *
 * @param {Compiler} compiler
 * @returns {Plugin}
 */
export function fromHandlers(compiler) {
  return {
    name: 'repl-sdk:compiler-handlers',

    async transform(code, url) {
      if (!url.startsWith(NODE_MODULES_PREFIX)) return;

      const handler = compiler.handlers?.[extensionOf(url)];

      if (!handler) return;

      return /** @type {string} */ (await handler(code));
    },
  };
}
