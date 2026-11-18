/**
 * @typedef {import('../../types.ts').Plugin} Plugin
 */

import { installer } from '../../fs/store.js';
import { NODE_MODULES_PREFIX } from '../../fs/url.js';
import { deCDN } from '../../utils.js';

/**
 * name@version → module name → the file in that package that has it.
 *
 * @type {Map<string, Map<string, string>>}
 */
const byPackage = new Map();

/**
 * The renamed modules of the packages that the compile in progress pins.
 *
 * @type {Map<string, string>[]}
 */
let pinned = [];

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
    pinned = await Promise.all(
      Object.entries(versions).map(([name, range]) => renamedModulesOf(name, range))
    );
  },

  resolveId(id) {
    const vanilla = deCDN(id);

    for (const modules of pinned) {
      const target = modules.get(vanilla);

      if (target) return target;
    }
  },
};

/**
 * @param {string} name
 * @param {string} range
 * @returns {Promise<Map<string, string>>}
 */
async function renamedModulesOf(name, range) {
  const pkg = await installer.package(name, range);
  const key = `${name}@${pkg.manifest.version}`;
  let modules = byPackage.get(key);

  if (!modules) {
    modules = mapPackage(name, pkg.manifest);
    byPackage.set(key, modules);
  }

  return modules;
}

/**
 * @param {string} name
 * @param {import('../../types.ts').InstalledPackage['manifest']} manifest
 * @returns {Map<string, string>}
 */
function mapPackage(name, manifest) {
  /** @type {Map<string, string>} */
  const renamed = new Map();
  const { version } = manifest;
  const modules = manifest['ember-addon']?.['renamed-modules'];

  if (!modules) return renamed;

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

  return renamed;
}
