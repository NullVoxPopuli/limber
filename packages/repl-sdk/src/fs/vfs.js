import { npmUrl, parseNpmUrl, typeFor } from './url.js';

/**
 * @typedef {{ type: 'js' | 'css' | 'json' | 'ts', source: string }} VirtualFile
 * @typedef {import('./opfs-store.js').Pack} Pack
 */

/**
 * Files keyed by URL, which is the shape es-module-shims' source hook wants.
 *
 * Two kinds of file live here. Project files and compiled entries are written
 * as strings. Installed packages are mounted as a pack: one blob per package
 * in the origin private file system, with a table of offsets, read a slice at
 * a time. Reading is the only operation that has to know the difference,
 * which is why it is the only async one.
 */
export class VFS {
  /** @type {Map<string, VirtualFile>} */
  #files = new Map();

  /** @type {Map<string, Pack>} url prefix => pack */
  #packs = new Map();

  /**
   * @param {string} url
   * @param {string} source
   * @param {'js' | 'css' | 'json' | 'ts'} [type]
   */
  write(url, source, type) {
    this.#files.set(url, { type: type ?? typeFor(url), source });
  }

  /**
   * Make a stored package's files readable at their npm urls.
   *
   * @param {string} name
   * @param {string} version
   * @param {Pack} pack
   */
  mount(name, version, pack) {
    this.#packs.set(npmUrl(name, version, ''), pack);
  }

  /**
   * @param {string} url
   * @returns {Promise<undefined | VirtualFile>}
   */
  async read(url) {
    const inline = this.#files.get(url);

    if (inline) return inline;

    const located = this.#locate(url);

    if (!located) return;

    const [pack, path] = located;
    const range = pack.files[path];

    if (!range) return;

    const [offset, length] = range;
    const source = await pack.blob.slice(offset, offset + length).text();

    return { type: typeFor(url), source };
  }

  /**
   * @param {string} url
   * @returns {boolean}
   */
  delete(url) {
    return this.#files.delete(url);
  }

  /**
   * @param {string} url
   * @returns {boolean}
   */
  has(url) {
    if (this.#files.has(url)) return true;

    const located = this.#locate(url);

    return Boolean(located && located[1] in located[0].files);
  }

  /**
   * @param {string} [prefix]
   * @returns {string[]}
   */
  list(prefix = '') {
    const urls = Array.from(this.#files.keys());

    for (const [base, pack] of this.#packs) {
      for (const path of Object.keys(pack.files)) {
        urls.push(base + path);
      }
    }

    return urls.filter((url) => url.startsWith(prefix));
  }

  get size() {
    let size = this.#files.size;

    for (const pack of this.#packs.values()) {
      size += Object.keys(pack.files).length;
    }

    return size;
  }

  clear() {
    this.#files.clear();
    this.#packs.clear();
  }

  /**
   * @param {string} url
   * @returns {undefined | [Pack, string]}
   */
  #locate(url) {
    const parsed = parseNpmUrl(url);

    if (!parsed) return;

    const pack = this.#packs.get(npmUrl(parsed.name, parsed.version, ''));

    if (!pack) return;

    return [pack, parsed.path];
  }
}

/**
 * The es-module-shims `source` hook, which supersedes the `fetch` hook the
 * Compiler uses today (es-module-shims marks `fetch` deprecated in favor of
 * this one).
 *
 * Async on purpose. This is what lets `resolve` stay dumb: anything the
 * installer missed can still be fetched here, without having to hand out an
 * opaque placeholder URL from a synchronous resolve first.
 *
 * @param {VFS} vfs
 * @param {(url: string) => Promise<void>} [onMiss] install-on-demand escape hatch
 */
export function createSourceHook(vfs, onMiss) {
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

    if (!vfs.has(path) && onMiss) {
      await onMiss(path);
    }

    const file = await vfs.read(path);

    if (file) return { url, type: file.type, source: file.source };

    return defaultSourceHook(url, fetchOpts, parent);
  };
}
