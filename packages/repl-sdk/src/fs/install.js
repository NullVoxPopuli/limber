import { resolve } from '../resolve.js';
import { parseSpecifier } from '../specifier.js';
import { assert } from '../utils.js';
import { openPack } from './opfs-store.js';
import { satisfiesRange } from './semver.js';
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

  /** @type {Set<string>} scopes already registered */
  #scoped = new Set();

  /** @type {Map<string, import('../types.ts').UntarredPackage>} name@version */
  #packages = new Map();

  /** @type {(map: { imports?: Record<string, string>, scopes?: Record<string, Record<string, string>> }) => void} */
  #addImportMap;

  /**
   * @param {{ vfs: VFS, getTar: GetTar, addImportMap?: (map: any) => void }} options
   */
  constructor({ vfs, getTar, addImportMap }) {
    this.#vfs = vfs;
    this.#getTar = getTar;
    this.#addImportMap = addImportMap ?? defaultAddImportMap;
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
    this.#scoped.clear();
    this.#packages.clear();
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
    const range = decodeURIComponent(version);
    const untarred = this.#reuse(name, range) ?? (await this.#download(name, range));
    const installed = untarred.manifest.version;

    await this.#unpack(name, installed, untarred);
    this.#scopeDependencies(name, installed, untarred.manifest);

    const answer = resolve(untarred, requestFor(name, installed, to));

    if (!answer) {
      throw new Error(`Could not resolve ${to} in ${name}@${installed}`);
    }

    return npmUrl(name, installed, answer.inTarFile);
  }

  /**
   * A copy we already have that satisfies the range, rather than a second one.
   *
   * More aggressive than pnpm, which keys a copy on the resolved version and
   * would happily keep both `~1.2.0` at 1.2.9 and `^1.2.0` at 1.9.0. In a
   * browser two copies of a package is not just wasted bytes: anything that
   * relies on being a singleton, which in Ember's case is most of
   * `@glimmer/*`, breaks in ways that are miserable to debug.
   *
   * @param {string} name
   * @param {string} range
   * @returns {undefined | import('../types.ts').UntarredPackage}
   */
  #reuse(name, range) {
    for (const [key, pkg] of this.#packages) {
      if (!key.startsWith(`${name}@`)) continue;
      if (satisfiesRange(pkg.manifest.version, range)) return pkg;
    }

    return undefined;
  }

  /**
   * @param {string} name
   * @param {string} range
   * @returns {Promise<import('../types.ts').UntarredPackage>}
   */
  async #download(name, range) {
    const untarred = await this.#getTar(name, range);

    this.#packages.set(`${name}@${untarred.manifest.version}`, untarred);

    return untarred;
  }

  /**
   * A package's dependency versions come from its own package.json, so two
   * packages can want different versions of the same thing and both get what
   * they asked for.
   *
   * Import map scopes are the web's version of node_modules nesting: instead
   * of a directory the resolver walks up from, a URL prefix that says "for
   * modules under here, this name means this". Registering the scope while
   * the package is being fetched is early enough, because the loader has not
   * looked at its imports yet.
   *
   * @param {string} name
   * @param {string} version
   * @param {import('../types.ts').UntarredPackage['manifest']} manifest
   */
  #scopeDependencies(name, version, manifest) {
    const scope = `${NPM_PREFIX}${name}@${version}/`;

    if (this.#scoped.has(scope)) return;

    this.#scoped.add(scope);

    const dependencies = /** @type {Record<string, string> | undefined} */ (
      /** @type {unknown} */ (manifest.dependencies)
    );

    if (!dependencies) return;

    /** @type {Record<string, string>} */
    const imports = {};

    for (const [dependency, range] of Object.entries(dependencies)) {
      const target = `${NPM_PREFIX}${dependency}@${encodeURIComponent(range)}`;

      imports[dependency] = target;
      /**
       * So `dep/some/file.js` from inside this package gets the same version.
       */
      imports[`${dependency}/`] = `${target}/`;
    }

    if (Object.keys(imports).length === 0) return;

    this.#addImportMap({ scopes: { [scope]: imports } });
  }

  /**
   * @param {string} name
   * @param {string} version
   * @param {import('../types.ts').UntarredPackage} untarred
   */
  async #unpack(name, version, untarred) {
    const key = `${name}@${version}`;

    if (this.#unpacked.has(key)) return;

    if (untarred.contents) {
      for (const [path, file] of Object.entries(untarred.contents)) {
        this.#vfs.write(npmUrl(name, version, path), file.text);
      }
    } else {
      const pack = await openPack(name, version);

      assert(`${key} was stored but cannot be opened`, pack);

      this.#vfs.mount(name, version, pack);
    }

    this.#unpacked.add(key);
  }
}

/**
 * es-module-shims installs `importShim` on the global once it loads, which is
 * after this module is evaluated.
 *
 * @param {any} map
 */
function defaultAddImportMap(map) {
  /** @type {any} */
  const shim = globalThis /** @type {any} */.importShim;

  shim?.addImportMap?.(map);
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
