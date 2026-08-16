import { resolve } from '../resolve.js';
import { parseSpecifier } from '../specifier.js';
import { NPM_PREFIX, npmUrl } from './url.js';

/**
 * @typedef {import('./vfs.js').VFS} VFS
 * @typedef {(name: string, version: string) => Promise<import('../types.ts').UntarredPackage>} GetTar
 */

/**
 * Unpacks packages into the fs and reports where their entry points landed.
 *
 * Everything async lives here. A synchronous `resolve` only has to name the
 * package, at a subpath, at whatever range was asked for: `file:///npm/nanoid`
 * or `file:///npm/nanoid@6/non-secure`. This turns that into the URL of a file
 * that now exists, and es-module-shims uses the URL the source hook returns as
 * the base for that module's own relative imports, so nothing downstream has
 * to know the first URL was provisional.
 */
export class Installer {
  /** @type {VFS} */
  #vfs;
  /** @type {GetTar} */
  #getTar;

  /** @type {Record<string, string>} specifier => url */
  #imports = {};

  /** @type {Set<string>} name@version already unpacked */
  #unpacked = new Set();

  /** @type {Map<string, Promise<string>>} */
  #resolving = new Map();

  /**
   * @param {{ vfs: VFS, getTar: GetTar }} options
   */
  constructor({ vfs, getTar }) {
    this.#vfs = vfs;
    this.#getTar = getTar;
  }

  /**
   * Everything installed so far, as an import map. Not needed for resolution,
   * which is why `resolve` can be as simple as it is. Useful for debugging and
   * for showing which versions a demo actually ran against.
   */
  get imports() {
    return { ...this.#imports };
  }

  clear() {
    this.#imports = {};
    this.#unpacked.clear();
    this.#resolving.clear();
  }

  /**
   * @param {string} specifier `nanoid`, `nanoid/non-secure`, `nanoid@6.0.1`
   * @returns {Promise<{ specifier: string, url: string, name: string, version: string }>}
   */
  async install(specifier) {
    const { name, version = 'latest', path } = parseSpecifier(specifier);

    const url = await this.#resolveIn(name, version, path);

    this.#imports[specifier] = url;

    return { specifier, url, ...parsePackage(url) };
  }

  /**
   * Turn a provisional URL into the URL of a file that exists.
   *
   * @param {string} url
   * @returns {Promise<string | undefined>}
   */
  resolveUrl(url) {
    if (!url.startsWith(NPM_PREFIX)) return Promise.resolve(undefined);

    /**
     * Already a real file. Relative imports inside a package land here.
     */
    if (this.#vfs.has(url)) return Promise.resolve(url);

    const existing = this.#resolving.get(url);

    if (existing) return existing;

    const promise = this.#resolveProvisional(url);

    this.#resolving.set(url, promise);

    return promise;
  }

  /**
   * @param {string} url
   * @returns {Promise<string>}
   */
  async #resolveProvisional(url) {
    const rest = url.slice(NPM_PREFIX.length);
    const subpathImport = readSubpathImport(rest);

    if (subpathImport) {
      const { name, version, to } = subpathImport;

      return this.#resolveIn(name, version, to);
    }

    const { name, version = 'latest', path } = parseSpecifier(rest);

    return this.#resolveIn(name, version, path);
  }

  /**
   * @param {string} name
   * @param {string} version npm version or dist-tag
   * @param {string} to subpath, in `exports` form: `.`, `./thing`, `#private`
   * @returns {Promise<string>}
   */
  async #resolveIn(name, version, to) {
    const untarred = await this.#getTar(name, version);
    const installed = untarred.manifest.version;

    this.#unpack(name, installed, untarred);

    const answer = resolve(untarred, requestFor(name, installed, to));

    if (!answer) {
      throw new Error(`Could not resolve ${to} in ${name}@${installed}`);
    }

    return npmUrl(name, installed, answer.inTarFile);
  }

  /**
   * @param {string} name
   * @param {string} version
   * @param {import('../types.ts').UntarredPackage} untarred
   */
  #unpack(name, version, untarred) {
    const key = `${name}@${version}`;

    if (this.#unpacked.has(key)) return;

    for (const [path, file] of Object.entries(untarred.contents)) {
      this.#vfs.write(npmUrl(name, version, path), file.text);
    }

    this.#unpacked.add(key);
  }
}

/**
 * Subpath imports (`#private/thing`) are resolved against the importing
 * package's own manifest, so the package has to travel with the specifier.
 * `#` starts a URL fragment, hence the encoding.
 *
 * @param {string} rest everything after `file:///npm/`
 * @returns {undefined | { name: string, version: string, to: string }}
 */
function readSubpathImport(rest) {
  const slash = rest.lastIndexOf('/');

  if (slash < 0) return;

  const last = decodeURIComponent(rest.slice(slash + 1));

  if (!last.startsWith('#')) return;

  const pkg = parsePackage(`${NPM_PREFIX}${rest.slice(0, slash)}/`);

  if (!pkg) return;

  return { name: pkg.name, version: pkg.version, to: last };
}

/**
 * @param {string} url
 * @returns {{ name: string, version: string }}
 */
function parsePackage(url) {
  const match = /^(@[^/]+\/[^/@]+|[^/@][^/]*)@([^/]+)/.exec(url.slice(NPM_PREFIX.length));

  return { name: match?.[1] ?? '', version: match?.[2] ?? '' };
}

/**
 * `resolve()` wants a Request. It reads five things, and `from` is what drives
 * the parent-chain walk that real URLs make unnecessary, so it is never set.
 *
 * @param {string} name
 * @param {string} version
 * @param {string} to
 */
function requestFor(name, version, to) {
  return /** @type {import('../resolve.js').ResolveRequest} */ ({
    name,
    version,
    to,
    from: undefined,
    original: `${name}@${version}${to === '.' ? '' : to.replace(/^\./, '')}`,
    key: `${name}@${version}/${to}`,
  });
}
