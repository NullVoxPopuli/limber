import { resolve } from '../resolve.js';
import { parseSpecifier } from '../specifier.js';
import { maxSatisfying, satisfiesRange } from './semver.js';
import { NODE_MODULES_PREFIX, npmUrl, parseNpmUrl } from './url.js';

/**
 * @typedef {import('../types.ts').InstalledPackage} InstalledPackage
 * @typedef {Pick<import('./worker.js').FsWorker, 'install' | 'installed' | 'link' | 'links'>} Installs
 */

/**
 * Puts packages in the file system and reports where their entry points landed.
 *
 * Everything async lives here. A synchronous `resolve` only has to name the
 * package, at a subpath, at whatever range was asked for:
 * `file:///node_modules/nanoid` or `file:///node_modules/nanoid@6/non-secure`.
 * This turns that into the URL of a file that now exists, under `.deps`, and
 * es-module-shims uses the URL the source hook returns as the base for that
 * module's own relative imports, so nothing downstream has to know the first
 * URL was provisional.
 *
 * A package asked for with no version means the linked one, the way
 * `node_modules/<name>` does. The first version resolved for a name gets the
 * link, and a reload keeps it.
 *
 * The worker does the downloading and unpacking. What comes back is only the
 * manifest and the list of files, which is all resolution needs.
 */
export class Installer {
  /** @type {Installs} */
  #worker;

  /** @type {Record<string, string>} specifier => url */
  #imports = {};

  /** @type {Map<string, Promise<string>>} */
  #resolving = new Map();

  /** @type {Set<string>} scopes already registered */
  #scoped = new Set();

  /** @type {Map<string, InstalledPackage>} name@version, resolved this session */
  #packages = new Map();

  /** @type {undefined | Promise<Record<string, string[]>>} what storage had when first asked */
  #stored;

  /** @type {undefined | Promise<Record<string, string>>} name → linked version, kept current */
  #links;

  /** @type {(map: { imports?: Record<string, string>, scopes?: Record<string, Record<string, string>> }) => void} */
  #addImportMap;

  /**
   * @param {{ worker: Installs, addImportMap?: (map: any) => void }} options
   */
  constructor({ worker, addImportMap }) {
    this.#worker = worker;
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
    this.#resolving.clear();
    this.#scoped.clear();
    this.#packages.clear();
    this.#stored = undefined;
    this.#links = undefined;
  }

  /**
   * @param {string} specifier `nanoid`, `nanoid/non-secure`, `nanoid@6.0.1`
   * @returns {Promise<{ specifier: string, url: string, name: string, version: string }>}
   */
  async install(specifier) {
    const { name, version = 'latest', path } = parseSpecifier(specifier);
    const url = await this.#resolveIn(name, version, path);
    const installed = /** @type {{ name: string, version: string }} */ (parseNpmUrl(url));

    this.#imports[specifier] = url;

    return { specifier, url, name: installed.name, version: installed.version };
  }

  /**
   * Puts a package in the file system without asking for a file in it.
   *
   * For packages that only get read, type declarations for one. The linked
   * version wins when there is one, so what gets read is what runs.
   *
   * @param {string} name
   * @param {string} version an exact version, for when nothing is linked
   * @returns {Promise<string>} the version in storage
   */
  async ensure(name, version) {
    this.#links ??= this.#worker.links();

    const range = (await this.#links)[name] ?? version;
    const pkg = this.#reuse(name, range) ?? (await this.#install(name, range));

    return pkg.manifest.version;
  }

  /**
   * Turn a provisional URL into the URL of a file that exists.
   *
   * @param {string} url
   * @returns {Promise<string | undefined>}
   */
  resolveUrl(url) {
    if (!url.startsWith(NODE_MODULES_PREFIX)) return Promise.resolve(undefined);

    /**
     * Already a real file. Relative imports inside a package land here.
     */
    if (this.#isFile(url)) return Promise.resolve(url);

    const existing = this.#resolving.get(url);

    if (existing) return existing;

    const promise = this.#resolveProvisional(url);

    this.#resolving.set(url, promise);

    return promise;
  }

  /**
   * @param {string} url
   * @returns {boolean}
   */
  #isFile(url) {
    const parsed = parseNpmUrl(url);

    if (!parsed) return false;

    const pkg = this.#packages.get(`${parsed.name}@${parsed.version}`);

    return Boolean(pkg?.files.has(parsed.path));
  }

  /**
   * @param {string} url
   * @returns {Promise<string>}
   */
  async #resolveProvisional(url) {
    /**
     * A subpath import, `#private/thing`, is resolved against the manifest of
     * the package it appears in, so it arrives as a `.deps` URL of that
     * package with the specifier as the path.
     */
    const inPackage = parseNpmUrl(url);

    if (inPackage) {
      return this.#resolveIn(inPackage.name, inPackage.version, decodeURIComponent(inPackage.path));
    }

    const {
      name,
      version = 'latest',
      path,
    } = parseSpecifier(url.slice(NODE_MODULES_PREFIX.length));

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
    const pkg = this.#reuse(name, range) ?? (await this.#install(name, range));
    const installed = pkg.manifest.version;

    this.#scopeDependencies(name, installed, pkg.manifest);

    const answer = resolve(pkg, requestFor(name, installed, to));

    if (!answer) {
      throw new Error(`Could not resolve ${to} in ${name}@${installed}`);
    }

    return npmUrl(name, installed, answer.inTarFile);
  }

  /**
   * A copy this session already resolved that satisfies the range, rather
   * than a second one.
   *
   * More aggressive than pnpm, which keys a copy on the resolved version and
   * would happily keep both `~1.2.0` at 1.2.9 and `^1.2.0` at 1.9.0. In a
   * browser two copies of a package is not just wasted bytes: anything that
   * relies on being a singleton, which in Ember's case is most of
   * `@glimmer/*`, breaks in ways that are miserable to debug.
   *
   * @param {string} name
   * @param {string} range
   * @returns {undefined | InstalledPackage}
   */
  #reuse(name, range) {
    for (const [key, pkg] of this.#packages) {
      if (!key.startsWith(`${name}@`)) continue;
      if (satisfiesRange(pkg.manifest.version, range)) return pkg;
    }

    return undefined;
  }

  /**
   * A copy that survived a reload is asked for by its exact version, which
   * is what lets the worker answer without touching the registry. Anything
   * else goes to the registry as the range that was asked for.
   *
   * @param {string} name
   * @param {string} range
   * @returns {Promise<InstalledPackage>}
   */
  async #install(name, range) {
    this.#stored ??= this.#worker.installed();
    this.#links ??= this.#worker.links();

    const links = await this.#links;
    const stored = (await this.#stored)[name] ?? [];
    const linked = range === 'latest' ? links[name] : undefined;
    const pkg = await this.#worker.install(name, linked ?? maxSatisfying(stored, range) ?? range);

    this.#packages.set(`${name}@${pkg.manifest.version}`, pkg);

    if (!links[name]) {
      links[name] = pkg.manifest.version;
      await this.#worker.link(name, pkg.manifest.version);
    }

    return pkg;
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
   * @param {InstalledPackage['manifest']} manifest
   */
  #scopeDependencies(name, version, manifest) {
    const scope = npmUrl(name, version);

    if (this.#scoped.has(scope)) return;

    this.#scoped.add(scope);

    const dependencies = /** @type {Record<string, string> | undefined} */ (
      /** @type {unknown} */ (manifest.dependencies)
    );

    if (!dependencies) return;

    /** @type {Record<string, string>} */
    const imports = {};

    for (const [dependency, range] of Object.entries(dependencies)) {
      const target = `${NODE_MODULES_PREFIX}${dependency}@${encodeURIComponent(range)}`;

      imports[dependency] = target;
      /**
       * So `dep/some/file.js` from inside this package gets the same version.
       */
      imports[`${dependency}/`] = `${target}/`;
    }

    if (Object.keys(imports).length === 0) return;

    this.#addImportMap({ scopes: { [scope]: imports } });
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
