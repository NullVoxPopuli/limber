/**
 * Every installed file gets a URL that says what it is.
 *
 * This is the whole point of the module fs. Today a resolution returns
 * `file:///tgz.repl.sdk/unzipped/repl-request-3`, which carries no path, so a
 * relative import from inside a package can't be resolved by URL semantics and
 * has to be reconstructed from a parent chain threaded through `?from=` query
 * params. Put the identity in the URL and `new URL(id, parentUrl)` is the whole
 * algorithm.
 */
export const NPM_PREFIX = 'file:///npm/';

/**
 * Modules that aren't files anywhere: a live object the host handed us, or a
 * loader a compiler config supplied.
 */
export const VIRTUAL_PREFIX = 'file:///virtual/';

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
  return `${NPM_PREFIX}${specifier}`;
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

  return `${NPM_PREFIX}${name}@${version}/${cleaned}`;
}

/**
 * @param {string} url
 * @returns {undefined | { name: string, version: string, path: string }}
 */
export function parseNpmUrl(url) {
  if (!url.startsWith(NPM_PREFIX)) return;

  const match = NPM_URL.exec(url.slice(NPM_PREFIX.length));

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
