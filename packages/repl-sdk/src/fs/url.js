/**
 * Every file has a URL that says what it is, and the URL's path is the file's
 * path in storage. `new URL(id, parentUrl)` is the whole resolution algorithm
 * for relative imports, and a reader of the storage finds the same paths.
 *
 *   file:///node_modules/nanoid@6.0.1/index.js  →  /node_modules/nanoid@6.0.1/index.js
 *   file:///src/index.gjs                       →  /src/index.gjs
 */
export const NODE_MODULES_PREFIX = 'file:///node_modules/';

/**
 * Where the compiled snippet lives.
 */
export const SRC_PREFIX = 'file:///src/';

/**
 * Modules that aren't files anywhere: a live object the host handed us, or a
 * loader a compiler config supplied.
 */
export const VIRTUAL_PREFIX = 'file:///virtual/';

/**
 * @param {string} url
 * @returns {string} the path in storage, without the query
 */
export function pathOf(url) {
  return new URL(url).pathname;
}

/**
 * @param {string} path an absolute path in storage
 * @returns {string}
 */
export function urlFor(path) {
  return `file://${path}`;
}

/**
 * What a synchronous `resolve` can say about a bare specifier before anything
 * has been downloaded: which package, at which range, at which subpath.
 *
 * The source hook turns this into a real file URL, and es-module-shims uses
 * the URL the source hook returns as the base for that module's own relative
 * imports, so nothing else has to know this URL was ever provisional.
 *
 * @param {string} specifier
 * @returns {string}
 */
export function specifierUrl(specifier) {
  return `${NODE_MODULES_PREFIX}${specifier}`;
}

/**
 * @param {'manual' | 'configured'} kind
 * @param {string} name
 * @returns {string}
 */
export function virtualUrl(kind, name) {
  return `${VIRTUAL_PREFIX}${kind}/${name}`;
}

/**
 * @param {string} url
 * @returns {undefined | { kind: string, name: string }}
 */
export function parseVirtualUrl(url) {
  if (!url.startsWith(VIRTUAL_PREFIX)) return;

  const rest = url.slice(VIRTUAL_PREFIX.length);
  const slash = rest.indexOf('/');

  if (slash < 0) return;

  return { kind: rest.slice(0, slash), name: rest.slice(slash + 1) };
}

/**
 * `@scope/name@version/rest` or `name@version/rest`
 */
const NPM_URL = /^(@[^/]+\/[^/@]+|[^/@][^/]*)@([^/]+)(?:\/(.*))?$/;

/**
 * @param {string} name
 * @param {string} version
 * @param {string} [path]
 * @returns {string}
 */
export function npmUrl(name, version, path = '') {
  const cleaned = path.replace(/^\.\//, '').replace(/^\//, '');

  return `${NODE_MODULES_PREFIX}${name}@${version}/${cleaned}`;
}

/**
 * @param {string} url
 * @returns {undefined | { name: string, version: string, path: string }}
 */
export function parseNpmUrl(url) {
  if (!url.startsWith(NODE_MODULES_PREFIX)) return;

  const match = NPM_URL.exec(url.slice(NODE_MODULES_PREFIX.length));

  if (!match) return;

  const [, name, version, path = ''] = match;

  if (!name || !version) return;

  return { name, version, path };
}

const TYPES = {
  css: 'css',
  json: 'json',
  ts: 'ts',
};

/**
 * The extension of the file a URL names, ignoring its query and hash.
 * Empty when there is none, or when the input is not a URL.
 *
 * @param {string} url
 * @returns {string}
 */
export function extensionOf(url) {
  let pathname;

  try {
    pathname = new URL(url).pathname;
  } catch {
    return '';
  }

  const file = pathname.slice(pathname.lastIndexOf('/') + 1);
  const dot = file.lastIndexOf('.');

  return dot > 0 ? file.slice(dot + 1) : '';
}

/**
 * The `type` the source hook has to report. Everything that isn't css, json or
 * ts is js as far as the loader is concerned.
 *
 * @param {string} url
 * @returns {'js' | 'css' | 'json' | 'ts'}
 */
export function typeFor(url) {
  const ext = extensionOf(url);

  return /** @type {'js' | 'css' | 'json' | 'ts'} */ (
    TYPES[/** @type {keyof typeof TYPES} */ (ext)] ?? 'js'
  );
}
