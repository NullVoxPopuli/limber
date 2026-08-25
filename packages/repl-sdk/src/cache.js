import { assert } from './utils.js';

export const secretKey = '__repl-sdk__compiler__';

/**
 * @typedef {typeof globalThis & { [secret]?: {
 *   tarballs?: Map<string, import('./types.ts').UntarredPackage>,
 *   resolves?: { [modulePath: string]: unknown },
 *   promiseCache?: Map<string, Promise<unknown>>,
 *   caches?: Caches
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
   * For any key, store a promise for resolving later
   *
   * @type {Map<string, Promise<unknown>>}
   */
  get promiseCache() {
    this.#root.promiseCache ||= new Map();

    return this.#root.promiseCache;
  }

  /**
   * @template Return
   * @type {(key: string, callback: () => Promise<any>) => Promise<any>}
   */
  cachedPromise(key, callback) {
    const existing = this.promiseCache.get(key);

    if (existing) {
      return /** @type {Promise<Return>} */ (existing);
    }

    const promise = callback();

    this.promiseCache.set(key, promise);

    return promise;
  }

  get #root() {
    const global = getGlobal();

    global[secret] ||= {};
    global[secret].caches ||= this;

    return global[secret];
  }
}

export function deleteCache() {
  if (!getGlobal()?.[secret]) {
    return;
  }

  delete getGlobal()[secret];
}

export const cache = new Caches();
