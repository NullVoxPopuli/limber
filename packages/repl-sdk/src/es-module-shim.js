/**
 * es-module-shim can only be initialized once.
 * it freezes its caches and options passed to it.
 *
 * So... here we are. Making stuff dynamic so we can have es-module-shims
 * deal with the "most recent" instance of the compiler. The compiler holds
 * state, and our tests share all globals as they run in the same browser window.
 */

/**
 * @type {{ resolve: import('./types.ts').ResolveHook, source: import('./types.ts').SourceHook }}
 */
export const STABLE_REFERENCE = {
  resolve: () => {
    throw new Error(
      `'resolve' not implemented in STABLE_REFERENCE. Has the Compiler been set up correctly?`
    );
  },
  source: async () => {
    throw new Error(
      `'source' not implemented in STABLE_REFERENCE. Has the Compiler been set up correctly?`
    );
  },
};

globalThis.esmsInitOptions = {
  shimMode: true,
  revokeBlobURLs: true, // default false
  mapOverrides: true, // default false

  /**
   * @param {string} id
   * @param {string} parentUrl
   * @param {(id: string, parentUrl: string) => string} resolve
   * @returns {string}
   */
  resolve: (id, parentUrl, resolve) => STABLE_REFERENCE.resolve(id, parentUrl, resolve),

  /**
   * Supersedes the `fetch` hook, which es-module-shims deprecated in favor of
   * this one. The important difference for us: the url this returns becomes
   * the base for the module's own relative imports. A synchronous resolve can
   * therefore answer with a URL that only names a package.
   *
   * @param {string} url
   * @param {RequestInit} fetchOpts
   * @param {string} parent
   * @param {(url: string, fetchOpts: RequestInit, parent: string) => Promise<any>} defaultSourceHook
   */
  source: (url, fetchOpts, parent, defaultSourceHook) =>
    STABLE_REFERENCE.source(url, fetchOpts, parent, defaultSourceHook),
};
