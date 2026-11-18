/**
 * Every file has a URL that says what it is, and the URL's path is the file's
 * path in storage. `new URL(id, parentUrl)` is the whole resolution algorithm
 * for relative imports, and a reader of the storage finds the same paths.
 *
 *   file:///node_modules/.deps/nanoid@6.0.1/index.js  →  /node_modules/.deps/nanoid@6.0.1/index.js
 *   file:///src/index.gjs                             →  /src/index.gjs
 *
 * Packages live under `.deps` by name and version, the way pnpm lays out its
 * store, so two versions of one package can be loaded at once. A bare
 * `file:///node_modules/nanoid` names the package at no particular version;
 * the installer turns it into a `.deps` URL.
 */
export const NODE_MODULES_PREFIX = 'file:///node_modules/';

/**
 * Where the installed files are.
 */
export const DEPS_PREFIX = `${NODE_MODULES_PREFIX}.deps/`;

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
 * Files from a CDN, by host and path:
 *
 *   https://esm.sh/react@19.2.3/es2022/react.mjs  →  file:///external/esm.sh/react@19.2.3/es2022/react.mjs
 */
export const EXTERNAL_PREFIX = 'file:///external/';

/**
 * A specifier that an async `resolveId` has not answered yet.
 * See Compiler#source.
 */
export const RESOLVING_PREFIX = 'file:///resolving/';

/**
 * @param {string} remote an http(s) URL
 * @returns {string}
 */
export function externalUrl(remote) {
  const url = new URL(remote);

  return `${EXTERNAL_PREFIX}${url.host}${url.pathname}${url.search}`;
}

/**
 * @param {string} url a URL under EXTERNAL_PREFIX
 * @returns {string} the http(s) URL that it came from
 */
export function remoteUrlOf(url) {
  return `https://${url.slice(EXTERNAL_PREFIX.length)}`;
}

/**
 * Where a CDN file is in storage.
 *
 * A CDN URL can name a file and a folder at once, such as
 * `esm.sh/@babel/standalone@8` and `esm.sh/@babel/standalone@8/lib.js`.
 * So each URL is a folder, and its text is in a file named `#` and the query.
 *
 * @param {string} url a URL under EXTERNAL_PREFIX
 * @returns {string}
 */
export function externalPath(url) {
  const { pathname, search } = new URL(url);

  return `${pathname.replace(/\/$/, '')}/#${encodeURIComponent(search)}`;
}

/**
 * @param {string} id
 * @param {string} importer
 * @returns {string}
 */
export function resolvingUrl(id, importer) {
  const params = new URLSearchParams({ id, importer });

  return `${RESOLVING_PREFIX}?${params}`;
}

/**
 * @param {string} url
 * @returns {undefined | { id: string, importer: string }}
 */
export function parseResolvingUrl(url) {
  if (!url.startsWith(RESOLVING_PREFIX)) return;

  const params = new URL(url).searchParams;
  const id = params.get('id');
  const importer = params.get('importer');

  if (id === null || importer === null) return;

  return { id, importer };
}

/**
 * @param {string} url
 * @returns {string} the path in storage, without the query
 */
export function pathOf(url) {
  return new URL(url).pathname;
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

  return `${DEPS_PREFIX}${name}@${version}/${cleaned}`;
}

/**
 * @param {string} url a `.deps` URL
 * @returns {undefined | { name: string, version: string, path: string }}
 */
export function parseNpmUrl(url) {
  if (!url.startsWith(DEPS_PREFIX)) return;

  const match = NPM_URL.exec(url.slice(DEPS_PREFIX.length));

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
