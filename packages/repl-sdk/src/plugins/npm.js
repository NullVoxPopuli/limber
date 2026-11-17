/**
 * @typedef {import('../types.ts').Plugin} Plugin
 * @typedef {(id: string, parentUrl: string) => string} DefaultResolve
 */

import { installer, storage } from '../fs/store.js';
import { NODE_MODULES_PREFIX, npmUrl, parseNpmUrl, pathOf, specifierUrl } from '../fs/url.js';
import { parseSpecifier } from '../specifier.js';
import { assert, deCDN } from '../utils.js';
import { tryResolve } from './renamed.js';

/**
 * node builtins that have a browser-shaped package on npm.
 */
const NODE_POLYFILLS = {
  'node:buffer': 'buffer',
  'node:crypto': 'crypto-browserify',
  'node:events': 'events',
  'node:fs': 'browserify-fs',
  'node:path': 'path-browser',
  'node:process': 'process',
  'node:stream': 'stream-browserify',
  'node:util': 'util-browser',
};

/**
 * The last plugin: relative URLs, and every bare specifier that nothing else claimed.
 *
 * Resolution is synchronous, and it stays synchronous by never trying to know anything it
 * would have to download to find out. A bare specifier becomes a URL that
 * names the package; `load` turns that into the URL of a real file.
 *
 * @param {() => DefaultResolve} defaultResolve the import map
 * @returns {Plugin}
 */
export function npm(defaultResolve) {
  return {
    name: 'repl-sdk:npm',

    resolveId(id, importer, { versions }) {
      const resolve = defaultResolve();

      /**
       * Subpath imports are private to the package that declares them, so the
       * package has to travel with the specifier. `#` starts a URL fragment,
       * hence the encoding.
       */
      const inPackage = id.startsWith('#') ? parseNpmUrl(importer) : undefined;

      if (inPackage) {
        return npmUrl(inPackage.name, inPackage.version, encodeURIComponent(id));
      }

      /**
       * The importer's URL already says where it lives, so this is URL math.
       */
      if (id.startsWith('.') || id.startsWith('/')) return resolve(id, importer);
      if (id.startsWith('https://') || id.startsWith('http://')) return resolve(id, importer);
      if (id.startsWith('blob:') || id.startsWith('file:')) return resolve(id, importer);

      const polyfill = NODE_POLYFILLS[/** @type {keyof typeof NODE_POLYFILLS} */ (id)];

      if (polyfill) return specifierUrl(polyfill);

      /**
       * The import map is where per-importer versions live. Installing a package
       * registers a scope saying what its dependency names mean, so a bare
       * specifier from inside that package lands on the version its own
       * package.json asked for. Unmapped specifiers throw, which just means
       * nobody has claimed this name for this importer.
       */
      const scoped = tryResolve(resolve, id, importer);

      if (scoped) return scoped;

      /**
       * A pin is per package, so `lodash/merge` uses the pin for `lodash`.
       * A version written in the specifier wins over the pin.
       */
      const vanilla = deCDN(id);
      const { name, version, path } = parseSpecifier(vanilla);
      const pinned = version ? undefined : versions[name];

      return pinned
        ? specifierUrl(`${name}@${encodeURIComponent(pinned)}${path.slice(1)}`)
        : specifierUrl(vanilla);
    },

    async load(id) {
      if (!id.startsWith(NODE_MODULES_PREFIX)) return;

      const real = await installer.resolveUrl(id);

      assert(`Could not resolve ${id}`, real);

      const source = await storage.read(pathOf(real));

      assert(`${real} resolved but is not in the fs`, source !== undefined);

      return { url: real, source };
    },
  };
}
