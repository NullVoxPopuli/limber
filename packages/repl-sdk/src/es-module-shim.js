/**
 * es-module-shim can only be initialized once.
 * it freezes its caches and options passed to it.
 *
 * So... here we are. Making stuff dynamic so we can have es-module-shims
 * deal with the "most recent" intance of the compiler
 * (since the compiler holds state,
 *  and our tests share all globals as they run in the same browser window).
 */

/**
 * @type {{
 *   resolve: (id: string, parentUrl: string, parentResolve: (id: string, parentUrl: string) => string) => string
 *   fetch: (id: string, options: RequestInit) => Promise<Response>
 * }}
 */
export const STABLE_REFERENCE = {
  onimport: async () => {
    throw new Error(
      `'fetch' not implemented in STABLE_REFERENCE. Has the Compiler been set up correctly?`
    );
  },
  resolve: () => {
    throw new Error(
      `'resolve' not implemented in STABLE_REFERENCE. Has the Compiler been set up correctly?`
    );
  },
  fetch: async () => {
    throw new Error(
      `'fetch' not implemented in STABLE_REFERENCE. Has the Compiler been set up correctly?`
    );
  },
};

globalThis.esmsInitOptions = {
  shimMode: true,
  // skip: [`https://esm.sh`, 'https://jspm.dev/', 'https://cdn.jsdelivr.net/'],
  revokeBlobURLs: true, // default false
  mapOverrides: true, // default false

  /**
* @param {string} url
* @param {unknown} options
* @param {string} parentUrl
* @param {string} source
@returns {void}
  */
  onimport: (url, options, parentUrl, source) =>
    STABLE_REFERENCE.onimport(url, options, parentUrl, source),

  /**
   * @param {string} id
   * @param {string} parentUrl
   * @param {(id: string, parentUrl: string) => string} resolve
   * @returns {string}
   */
  resolve: (id, parentUrl, resolve) => STABLE_REFERENCE.resolve(id, parentUrl, resolve),
  // NOTE: may need source hook
  //       https://github.com/guybedford/es-module-shims?tab=readme-ov-file#source-hook
  //

  /**
   * @param {string} url
   * @param {RequestInit} options
   * @returns {Promise<Response>}
   */
  fetch: (url, options) => STABLE_REFERENCE.fetch(url, options),
};
