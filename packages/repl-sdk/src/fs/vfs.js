import { typeFor } from './url.js';

/**
 * @typedef {{ type: 'js' | 'css' | 'json' | 'ts', source: string }} VirtualFile
 */

/**
 * Files keyed by URL, which is the shape es-module-shims' source hook wants.
 *
 * In-memory for now. OPFS belongs behind this same interface once tarballs
 * should survive a reload, and nothing above here has to know.
 */
export class VFS {
  /** @type {Map<string, VirtualFile>} */
  #files = new Map();

  /**
   * URLs the source hook has served, in order. The spike asserts against this
   * to show relative imports arrive as real paths.
   *
   * @type {string[]}
   */
  reads = [];

  /**
   * @param {string} url
   * @param {string} source
   * @param {'js' | 'css' | 'json' | 'ts'} [type]
   */
  write(url, source, type) {
    this.#files.set(url, { type: type ?? typeFor(url), source });
  }

  /**
   * @param {string} url
   * @returns {undefined | VirtualFile}
   */
  read(url) {
    const file = this.#files.get(url);

    if (file) this.reads.push(url);

    return file;
  }

  /**
   * @param {string} url
   * @returns {boolean}
   */
  has(url) {
    return this.#files.has(url);
  }

  /**
   * @param {string} [prefix]
   * @returns {string[]}
   */
  list(prefix = '') {
    return [...this.#files.keys()].filter((url) => url.startsWith(prefix));
  }

  get size() {
    return this.#files.size;
  }

  clear() {
    this.#files.clear();
    this.reads = [];
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

    const file = vfs.read(path);

    if (file) return { url, type: file.type, source: file.source };

    return defaultSourceHook(url, fetchOpts, parent);
  };
}
