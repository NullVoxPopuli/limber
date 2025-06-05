import { assert } from './utils.js';

export const secretKey = '__repl-sdk__compiler__';

/**
 * @typedef {object} ResolveIdValue
 * @property {string} name
 * @property {string} version
 * @property {import('./types.ts').RequestAnswer} path
 *
 *
 * @typedef {typeof globalThis & { [secret]?: {
 *   requestCache?: Map<string, Request>,
 *   resolveId?: Map<string, ResolveIdValue>,
 *   tarballs?: Map<string, import('./types.ts').UntarredPackage>,
 *   resolves?: { [modulePath: string]: unknown },
 *   promiseCache?: Map<string, Promise<unknown>>,
 *   fileCache?: Map<string, string>
 * } }} ExtendedWindow
 */
const secret = Symbol.for(secretKey);

function getGlobal() {
  const global = /** @type {ExtendedWindow} */ (globalThis);

  return global;
}

assert(
  `There is already an instance of repl-sdk, and there can only be one. Make sure that your dependency graph is correct.`,
  !getGlobal()[secret]
);

class Caches {
  clear() {
    delete getGlobal()[secret];
  }

  /**
   * Cache of resolved modulePaths to their module "value"
   *
   * @type {{ [modulePath: string]: unknown }}
   */
  get resolves() {
    this.#root.resolves ||= {};

    return this.#root.resolves;
  }

  /**
   * Cache of untarred tarballs
   *
   * @type {Map<string, import('./types.ts').UntarredPackage>}
   */
  get tarballs() {
    this.#root.tarballs ||= new Map();

    return this.#root.tarballs;
  }

  /**
   * Cache of request resolutions
   *
   * @type {Map<string, ResolveIdValue>}
   */
  get resolveId() {
    this.#root.resolveId ||= new Map();

    return this.#root.resolveId;
  }

  /**
   * Cache of request Key to file content string
   *
   * @type {Map<string, string>}
   */
  get fileCache() {
    this.#root.fileCache ||= new Map();

    return this.#root.fileCache;
  }

  /**
   * For any key, store a promise for resolving later
   *
   * @type {Map<string, Promise<unknown>>}
   */
  get promiseCache() {
    this.#root.promiseCache ||= new Map();

    return this.#root.promiseCache;
  }

  get requestCache() {
    this.#root.requestCache ||= new Map();

    return this.#root.requestCache;
  }

  get #root() {
    let global = getGlobal();

    global[secret] ||= {};

    return global[secret];
  }
}

export const cache = new Caches();
