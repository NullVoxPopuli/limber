/**
 * @typedef {import('../../types.ts').Plugin} Plugin
 */

import { installer } from '../../fs/store.js';
import { NODE_MODULES_PREFIX } from '../../fs/url.js';
import { deCDN } from '../../utils.js';

/**
 * Module name → the file in the pinned package that has it.
 * The module loader is global for the page, so this is too.
 *
 * @type {Map<string, string>}
 */
const renamed = new Map();

/**
 * name@version whose renamed modules are in `renamed`.
 *
 * @type {Set<string>}
 */
const mapped = new Set();

/**
 * Once the page pins a framework from npm, such as ember-source,
 * its addons come from npm too, so they match it.
 */
export function hasRenamedModules() {
  return renamed.size > 0;
}

/**
 * A v2 addon can publish modules under other names,
 * through `ember-addon.renamed-modules` in its package.json.
 * ember-source publishes all of `@ember/*` that way:
 *
 * ```json
 * "renamed-modules": {
 *   "@ember/owner/index.js": "ember-source/@ember/owner/index.js"
 * }
 * ```
 *
 * When a compile pins ember-source 6.12.1, `import { getOwner } from '@ember/owner'`
 * loads `ember-source/@ember/owner/index.js` from ember-source 6.12.1.
 *
 * A module that loaded before the pin keeps its first URL.
 *
 * @type {Plugin}
 */
export const renamedModules = {
  name: 'repl-sdk:ember-renamed-modules',

  /**
   * Resolution of these is synchronous, so the package installs before anything imports it.
   */
  async buildStart({ versions }) {
    await Promise.all(Object.entries(versions).map(([name, range]) => mapPackage(name, range)));
  },

  resolveId(id) {
    return renamed.get(deCDN(id));
  },
};

/**
 * @param {string} name
 * @param {string} range
 */
async function mapPackage(name, range) {
  const pkg = await installer.package(name, range);
  const { version } = pkg.manifest;
  const key = `${name}@${version}`;

  if (mapped.has(key)) return;

  mapped.add(key);

  const modules = pkg.manifest['ember-addon']?.['renamed-modules'];

  if (!modules) return;

  for (const [from, to] of Object.entries(modules)) {
    if (!to.startsWith(`${name}/`)) continue;

    const target = `${NODE_MODULES_PREFIX}${name}@${version}/${to.slice(name.length + 1)}`;

    /**
     * The keys name files:
     *
     *   @ember/owner/index.js             → @ember/owner
     *   @ember/component/template-only.js → @ember/component/template-only
     */
    renamed.set(from, target);
    renamed.set(from.replace(/(\/index)?\.js$/, ''), target);
  }
}
