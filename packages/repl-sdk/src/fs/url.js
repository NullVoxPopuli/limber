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
 * The `type` the source hook has to report. Everything that isn't css, json or
 * ts is js as far as the loader is concerned.
 *
 * @param {string} path
 * @returns {'js' | 'css' | 'json' | 'ts'}
 */
export function typeFor(path) {
  const ext = path.split('.').pop() ?? '';

  return /** @type {'js' | 'css' | 'json' | 'ts'} */ (
    TYPES[/** @type {keyof typeof TYPES} */ (ext)] ?? 'js'
  );
}
