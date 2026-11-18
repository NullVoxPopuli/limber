/**
 * @typedef {import('../types.ts').Plugin} Plugin
 * @typedef {import('../types.ts').Options} Options
 */

import { cache, secretKey } from '../cache.js';
import { satisfiesRange } from '../fs/semver.js';
import { parseVirtualUrl, virtualUrl } from '../fs/url.js';
import { virtualModuleSource } from '../fs/virtual.js';
import { parseSpecifier } from '../specifier.js';
import { assert, deCDN } from '../utils.js';

/**
 * Modules that the host provides, from the `resolve` option.
 *
 * A compile that pins a module's package loads that package from npm instead,
 * unless the pin accepts the version that the host provides.
 * A pin of a package that the module was built with does the same,
 * because the module would import the host's copy of that package.
 *
 * @param {Options['resolve']} modules
 * @param {Options['packages']} packages
 */
export function providedModules(modules = {}, packages = {}) {
  /**
   * @type {Map<string, string>}
   */
  const owners = new Map();

  for (const [name, info] of Object.entries(packages)) {
    for (const id of info.modules ?? []) owners.set(id, name);
  }

  /**
   * @param {string} id
   * @returns {string}
   */
  function packageOf(id) {
    return owners.get(id) ?? parseSpecifier(id).name;
  }

  /**
   * @param {string} name
   * @param {Record<string, string>} versions
   */
  function isPinnedAway(name, versions) {
    const range = versions[name];

    if (range === undefined) return false;

    const provided = packages[name]?.version;

    return !provided || !satisfiesRange(provided, range);
  }

  /**
   * @param {string} id
   * @param {Record<string, string>} versions
   */
  function isProvided(id, versions) {
    if (!Object.hasOwn(modules, id) || !modules[id]) return false;

    const name = packageOf(id);

    if (isPinnedAway(name, versions)) return false;

    return !(packages[name]?.builtWith ?? []).some((other) => isPinnedAway(other, versions));
  }

  /**
   * @type {Plugin & { packageOf: typeof packageOf }}
   */
  const plugin = {
    name: 'repl-sdk:provided',

    packageOf,

    resolveId(id, _importer, { versions }) {
      const vanilla = deCDN(id);

      if (!isProvided(vanilla, versions)) return;

      return virtualUrl('manual', vanilla);
    },

    async load(id) {
      const virtual = parseVirtualUrl(id);

      if (virtual?.kind !== 'manual') return;

      let value = await modules[virtual.name];

      if (typeof value === 'function') value = await value();

      assert(`Failed to resolve ${virtual.name}`, value);
      cache.resolves[virtual.name] = value;

      return virtualModuleSource(virtual.name, /** @type {object} */ (value), secretKey);
    },
  };

  return plugin;
}
