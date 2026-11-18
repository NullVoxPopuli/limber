/**
 * @typedef {import('./types.ts').Plugin} Plugin
 * @typedef {import('./types.ts').PluginContext} PluginContext
 * @typedef {{ url: string, type: 'js' | 'css' | 'json' | 'ts', source: string }} Loaded
 */

import { externalUrl, typeFor } from './fs/url.js';

/**
 * Runs the hooks of every plugin, in order.
 *
 * This is the only part of repl-sdk that plugins see.
 * The es-module-shims hooks in Compiler call into it,
 * and nothing of es-module-shims is passed to a plugin.
 */
export class Pipeline {
  /** @type {Plugin[]} */
  #first;

  /** @type {Plugin[]} */
  #added = [];

  /** @type {Plugin[]} */
  #last;

  /** @type {Plugin[]} */
  #all;

  /** @type {PluginContext['packages']} */
  #packages;

  /** @type {PluginContext} */
  ctx;

  /**
   * Each compile can change the answers, for example with a different pin.
   */
  #build = 0;

  /**
   * Answers of async `resolveId` hooks, and the ones still in progress,
   * by `cacheKey`.
   *
   * @type {Map<string, string | Promise<string | undefined>>}
   */
  #resolved = new Map();

  /**
   * @param {Plugin[]} first
   * @param {Plugin[]} last
   * @param {PluginContext['packages']} [packages]
   */
  constructor(first, last, packages = {}) {
    this.#packages = packages;
    this.ctx = { versions: {}, packages };
    this.#first = first;
    this.#last = last;
    this.#all = first.concat(last);
  }

  /**
   * Plugins of a compiler config, for the next `buildStart`.
   *
   * @param {Plugin[]} plugins
   * @returns {Plugin[]} the ones that were not in the pipeline yet
   */
  register(plugins) {
    /** @type {Plugin[]} */
    const added = [];

    for (const plugin of plugins) {
      if (this.#all.includes(plugin)) continue;

      this.#added.push(plugin);
      added.push(plugin);
    }

    this.#all = this.#first.concat(this.#added, this.#last);

    return added;
  }

  /**
   * Plugins of a compiler, which can load after `buildStart`.
   * Their `buildStart` runs now, for the compile in progress.
   *
   * @param {Plugin[]} plugins
   */
  async add(plugins) {
    const added = this.register(plugins);

    await Promise.all(added.map((plugin) => plugin.buildStart?.(this.ctx)));
  }

  /**
   * @param {PluginContext['versions']} versions
   */
  async buildStart(versions) {
    this.ctx = { versions, packages: this.#packages };
    this.#build += 1;
    this.#resolved.clear();

    await Promise.all(this.#all.map((plugin) => plugin.buildStart?.(this.ctx)));
  }

  /**
   * A string when every plugin up to the answer was synchronous,
   * else a promise.
   *
   * @param {string} id
   * @param {string} importer
   * @returns {string | undefined | Promise<string | undefined>}
   */
  resolveId(id, importer) {
    const cached = this.#resolved.get(cacheKey(id, importer));

    if (cached) return cached;

    return this.#resolveFrom(0, id, importer);
  }

  /**
   * @param {number} start
   * @param {string} id
   * @param {string} importer
   * @returns {string | undefined | Promise<string | undefined>}
   */
  #resolveFrom(start, id, importer) {
    for (let i = start; i < this.#all.length; i++) {
      const plugin = /** @type {Plugin} */ (this.#all[i]);

      if (!plugin.resolveId) continue;

      const answer = plugin.resolveId(id, importer, this.ctx);

      if (isPromise(answer)) {
        return this.#wait(answer, i, id, importer);
      }

      if (answer) return normalize(answer);
    }
  }

  /**
   * @param {Promise<string | null | undefined>} answer
   * @param {number} index of the plugin that gave the answer
   * @param {string} id
   * @param {string} importer
   */
  #wait(answer, index, id, importer) {
    const key = cacheKey(id, importer);
    const build = this.#build;

    const promise = answer
      .then((result) => (result ? normalize(result) : this.#resolveFrom(index + 1, id, importer)))
      .then((result) => {
        if (build !== this.#build) return result;

        if (result) {
          this.#resolved.set(key, result);
        } else {
          this.#resolved.delete(key);
        }

        return result;
      });

    if (build === this.#build) {
      this.#resolved.set(key, promise);
    }

    return promise;
  }

  /**
   * @param {string} id
   * @returns {Promise<Loaded | undefined>}
   */
  async load(id) {
    for (const plugin of this.#all) {
      if (!plugin.load) continue;

      const result = await plugin.load(id, this.ctx);

      if (result === null || result === undefined) continue;

      const loaded = typeof result === 'string' ? { source: result } : result;
      const url = loaded.url ?? id;
      const source = await this.#transform(loaded.source, url);

      return { url, type: loaded.type ?? typeFor(url), source };
    }
  }

  /**
   * @param {string} code
   * @param {string} url
   */
  async #transform(code, url) {
    let result = code;

    for (const plugin of this.#all) {
      if (!plugin.transform) continue;

      const next = await plugin.transform(result, url, this.ctx);

      if (typeof next === 'string') result = next;
    }

    return result;
  }
}

/**
 * The answer for one specifier depends on who imports it.
 *
 * @param {string} id
 * @param {string} importer
 */
function cacheKey(id, importer) {
  return `${importer}\n${id}`;
}

/**
 * @param {unknown} x
 * @returns {x is Promise<any>}
 */
function isPromise(x) {
  return typeof (/** @type {any} */ (x)?.then) === 'function';
}

/**
 * Every id is a file in the file system. A CDN file is too, once it downloads.
 * The page's own server is not a CDN.
 *
 * @param {string} id
 * @returns {string}
 */
function normalize(id) {
  if (!isRemote(id)) return id;

  return externalUrl(id);
}

/**
 * @param {string} id
 */
export function isRemote(id) {
  if (!id.startsWith('https://') && !id.startsWith('http://')) return false;

  return new URL(id).origin !== location.origin;
}

/**
 * Stands in for the module that an async `resolveId` finds.
 *
 * es-module-shims keys modules by the URL that its synchronous resolve returns.
 * Each importer gets one of these, and each of them imports the same id,
 * so the module itself loads one time.
 *
 * `export *` leaves out `default`, so it comes from the namespace.
 * That `default` is not a live binding, and it is `undefined` when the module has none.
 *
 * @param {string} id
 */
export function reexport(id) {
  const target = JSON.stringify(id);

  return [
    `export * from ${target};`,
    `import * as namespace from ${target};`,
    `export default namespace.default;`,
  ].join('\n');
}
