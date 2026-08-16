import { resolve } from '../resolve.js';
import { parseSpecifier } from '../specifier.js';
import { npmUrl } from './url.js';

/**
 * @typedef {import('./vfs.js').VFS} VFS
 * @typedef {(name: string, version: string) => Promise<import('../types.ts').UntarredPackage>} GetTar
 */

/**
 * Unpacks packages into the fs and reports where their entry points landed.
 *
 * Everything async happens here, once per package, before the loader asks for
 * anything. That is what allows `resolve` to be the default resolver plus an
 * import map: by the time a specifier needs resolving, its file already exists
 * at a real URL.
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

  /**
   * @param {{ vfs: VFS, getTar: GetTar }} options
   */
  constructor({ vfs, getTar }) {
    this.#vfs = vfs;
    this.#getTar = getTar;
  }

  /**
   * The accumulated import map. Hand this to `importShim.addImportMap`.
   */
  get imports() {
    return { ...this.#imports };
  }

  /**
   * @param {string} specifier `nanoid`, `nanoid/non-secure`, `nanoid@6.0.1`
   * @returns {Promise<{ specifier: string, url: string, name: string, version: string }>}
   */
  async install(specifier) {
    const { name, version = 'latest', path } = parseSpecifier(specifier);
    const untarred = await this.#getTar(name, version);
    const resolved = untarred.manifest.version;

    this.#unpack(name, resolved, untarred);

    const answer = resolve(untarred, requestFor(name, resolved, path));

    if (!answer) {
      throw new Error(`Could not resolve an entry for ${specifier}`);
    }

    const url = npmUrl(name, resolved, answer.inTarFile);

    this.#imports[specifier] = url;

    return { specifier, url, name, version: resolved };
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
 * `resolve()` wants a Request. It only reads these five, and `from` is what
 * drives the parent-chain walk that real URLs make unnecessary, so it is always
 * undefined here.
 *
 * @param {string} name
 * @param {string} version
 * @param {string} to
 */
function requestFor(name, version, to) {
  return /** @type {import('../request.js').Request} */ (
    /** @type {unknown} */ ({
      name,
      version,
      to,
      from: undefined,
      original: `${name}@${version}${to === '.' ? '' : to.replace(/^\./, '')}`,
      key: `${name}@${version}/${to}`,
    })
  );
}
