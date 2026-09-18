/**
 * The file system: the origin private file system, laid out like a project.
 *
 *   /node_modules/.deps/<name>@<version>/...   installed packages, unpacked
 *   /node_modules/<name>/.link                 which version `<name>` means
 *   /src/index.<ext>                           the compiled snippet
 *
 * Paths are absolute and match the path of the file's URL, so a reader that
 * only knows URLs and a reader that only knows the storage agree.
 *
 * The origin private file system has no symlinks, so a link is a directory
 * with a `.link` file naming the version. Reads under `/node_modules/<name>/`
 * follow it into `.deps`, which is what lets a reader that does not know
 * about versions, TypeScript for one, see a normal node_modules.
 *
 * Reads work on the main thread and in workers. Writes prefer sync access
 * handles, which every browser has in workers; `createWritable` is the
 * fallback where they are missing.
 *
 * A package is only trusted once its marker file exists, because a reload in
 * the middle of a write leaves the directory half full.
 */
export const NODE_MODULES = 'node_modules';
export const DEPS = '.deps';

const COMPLETE_MARKER = '.complete';
const LINK_MARKER = '.link';

const encoder = new TextEncoder();

/**
 * @typedef {import('../types.ts').InstalledPackage} InstalledPackage
 * @typedef {Record<string, { text: string }>} Contents
 * @typedef {{ truncate(size: number): void, write(buffer: Uint8Array): number, flush(): void, close(): void }} SyncAccessHandle
 */

/**
 * `name@version` → `name`, `version`. Scoped names keep their `/`.
 */
const PACKAGE_DIRECTORY = /^(.+)@([^@]+)$/;

/**
 * @param {string} name
 * @param {string} version
 * @returns {string} the package's directory
 */
export function packageDirectory(name, version) {
  return `/${NODE_MODULES}/${DEPS}/${name}@${version}`;
}

/**
 * @param {string} name
 * @returns {string} the link's directory
 */
export function linkDirectory(name) {
  return `/${NODE_MODULES}/${name}`;
}

/**
 * `/node_modules/<name>/<rest>` → the name and the rest, for a path that is
 * not in `.deps`. Scoped names take two segments.
 *
 * @param {string} path
 * @returns {undefined | { name: string, rest: string }}
 */
function throughLink(path) {
  const segments = segmentsOf(path);

  if (segments[0] !== NODE_MODULES || segments[1] === undefined || segments[1] === DEPS) return;

  const nameLength = segments[1].startsWith('@') ? 2 : 1;
  const name = segments.slice(1, 1 + nameLength).join('/');

  if (name.split('/').length !== nameLength) return;

  return { name, rest: segments.slice(1 + nameLength).join('/') };
}

/**
 * @param {any} error
 * @returns {boolean}
 */
function isNotFound(error) {
  return error?.name === 'NotFoundError';
}

/**
 * Asking for a file by the name of a directory, or the other way round.
 *
 * @param {any} error
 * @returns {boolean}
 */
function isWrongKind(error) {
  return error?.name === 'TypeMismatchError';
}

/**
 * @param {string} path
 * @returns {string[]}
 */
function segmentsOf(path) {
  return path.split('/').filter(Boolean);
}

export class Storage {
  /** @type {() => Promise<FileSystemDirectoryHandle>} */
  #getDirectory;

  /** @type {undefined | Promise<FileSystemDirectoryHandle>} */
  #root;

  /**
   * Directories already walked to, by path.
   *
   * Every step of a walk is a round trip to the browser process, and a
   * checker reads hundreds of files under the same few directories. A handle
   * names a path, not an entry, so one that outlives its directory throws
   * NotFoundError like a fresh lookup would, and a directory that comes back
   * under the same name is reachable through it again.
   *
   * @type {Map<string, FileSystemDirectoryHandle>}
   */
  #directories = new Map();

  /**
   * @param {() => Promise<FileSystemDirectoryHandle>} [getDirectory] the origin's root; tests pass a fake
   */
  constructor(getDirectory = () => navigator.storage.getDirectory()) {
    this.#getDirectory = getDirectory;
  }

  get root() {
    this.#root ??= this.#getDirectory();

    return this.#root;
  }

  /**
   * @param {string} path
   * @returns {Promise<undefined | string>}
   */
  async read(path) {
    const handle = await this.#file(await this.resolve(path), false);

    if (!handle) return undefined;

    const file = await handle.getFile();

    return file.text();
  }

  /**
   * @param {string} path
   * @returns {Promise<undefined | Uint8Array>}
   */
  async readBytes(path) {
    const handle = await this.#file(await this.resolve(path), false);

    if (!handle) return undefined;

    const file = await handle.getFile();

    return new Uint8Array(await file.arrayBuffer());
  }

  /**
   * What a path is, following links. Undefined when there is nothing there.
   *
   * @param {string} path
   * @returns {Promise<undefined | { type: 'file' | 'directory', size: number, mtime: number }>}
   */
  async stat(path) {
    const real = await this.resolve(path);
    const segments = segmentsOf(real);

    if (segments.length === 0) return { type: 'directory', size: 0, mtime: 0 };

    const handle = await this.#file(real, false);

    if (handle) {
      const file = await handle.getFile();

      return { type: 'file', size: file.size, mtime: file.lastModified };
    }

    const dir = await this.#directory(segments, false);

    return dir ? { type: 'directory', size: 0, mtime: 0 } : undefined;
  }

  /**
   * The names in a directory, following links, without the storage's markers.
   *
   * @param {string} path
   * @returns {Promise<undefined | { name: string, type: 'file' | 'directory' }[]>}
   */
  async entries(path) {
    const dir = await this.#directory(segmentsOf(await this.resolve(path)), false);

    if (!dir) return undefined;

    /** @type {{ name: string, type: 'file' | 'directory' }[]} */
    const result = [];

    for await (const [name, handle] of dir.entries()) {
      if (isMarker(name)) continue;

      result.push({ name, type: handle.kind });
    }

    return result;
  }

  /**
   * @param {string} path
   * @param {string} text
   */
  async write(path, text) {
    const handle = /** @type {FileSystemFileHandle} */ (await this.#file(path, true));

    await writeText(handle, text);
  }

  /**
   * @param {string} path
   * @returns {Promise<boolean>}
   */
  async exists(path) {
    return Boolean(await this.#file(await this.resolve(path), false));
  }

  /**
   * The real path of a file, following a link under `/node_modules/<name>/`
   * into `.deps`. Anything else is its own real path.
   *
   * @param {string} path
   * @returns {Promise<string>}
   */
  async resolve(path) {
    const link = throughLink(path);

    if (!link) return path;

    const version = await this.linkOf(link.name);

    if (!version) return path;

    return `${packageDirectory(link.name, version)}${link.rest ? `/${link.rest}` : ''}`;
  }

  /**
   * @param {string} name
   * @returns {Promise<undefined | string>} the version `<name>` links to
   */
  async linkOf(name) {
    const handle = await this.#file(`${linkDirectory(name)}/${LINK_MARKER}`, false);

    if (!handle) return undefined;

    const file = await handle.getFile();

    return (await file.text()).trim() || undefined;
  }

  /**
   * Makes `/node_modules/<name>` mean one installed version.
   *
   * @param {string} name
   * @param {string} version
   */
  link(name, version) {
    return this.write(`${linkDirectory(name)}/${LINK_MARKER}`, version);
  }

  /**
   * Every link, as name → version.
   *
   * @returns {Promise<Record<string, string>>}
   */
  async links() {
    /** @type {Record<string, string>} */
    const result = {};
    const nodeModules = await this.#directory([NODE_MODULES], false);

    if (!nodeModules) return result;

    /**
     * @param {FileSystemDirectoryHandle} dir
     * @param {string} scope
     */
    const collect = async (dir, scope) => {
      for await (const [entry, handle] of dir.entries()) {
        if (handle.kind !== 'directory' || entry === DEPS) continue;

        const directory = /** @type {FileSystemDirectoryHandle} */ (handle);

        if (!scope && entry.startsWith('@')) {
          await collect(directory, `${entry}/`);
          continue;
        }

        const version = await this.linkOf(`${scope}${entry}`);

        if (version) result[`${scope}${entry}`] = version;
      }
    };

    await collect(nodeModules, '');

    return result;
  }

  /**
   * @param {string} path a file or a directory
   */
  async remove(path) {
    const segments = segmentsOf(path);
    const last = segments.pop();

    if (!last) return;

    const parent = await this.#directory(segments, false);

    if (!parent) return;

    this.#directories.clear();

    try {
      await parent.removeEntry(last, { recursive: true });
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }
  }

  /**
   * Every file under a directory, as absolute paths.
   *
   * @param {string} path
   * @returns {Promise<string[]>}
   */
  async list(path) {
    const real = await this.resolve(path);
    const dir = await this.#directory(segmentsOf(real), false);

    if (!dir) return [];

    /** @type {string[]} */
    const files = [];

    await walk(dir, `/${segmentsOf(path).join('/')}`, (file) => {
      if (!isMarker(file)) files.push(file);
    });

    return files;
  }

  async clear() {
    const root = await this.root;

    this.#directories.clear();

    for await (const [entry] of root.entries()) {
      await root.removeEntry(entry, { recursive: true });
    }
  }

  /**
   * Every complete package, as name → versions.
   *
   * @returns {Promise<Record<string, string[]>>}
   */
  async installed() {
    /** @type {Record<string, string[]>} */
    const result = {};
    const deps = await this.#directory([NODE_MODULES, DEPS], false);

    if (!deps) return result;

    /**
     * @param {FileSystemDirectoryHandle} dir
     * @param {string} scope
     */
    const collect = async (dir, scope) => {
      for await (const [entry, handle] of dir.entries()) {
        if (handle.kind !== 'directory') continue;

        const directory = /** @type {FileSystemDirectoryHandle} */ (handle);

        if (!scope && entry.startsWith('@')) {
          await collect(directory, `${entry}/`);
          continue;
        }

        const match = PACKAGE_DIRECTORY.exec(entry);

        if (!match) continue;

        const [, name, version] = match;

        if (!name || !version) continue;
        if (!(await hasMarker(directory))) continue;

        (result[`${scope}${name}`] ??= []).push(version);
      }
    };

    await collect(deps, '');

    return result;
  }

  /**
   * The manifest and file list of a complete package.
   *
   * @param {string} name
   * @param {string} version
   * @returns {Promise<undefined | InstalledPackage>} undefined when the package is missing or incomplete
   */
  async readPackage(name, version) {
    const dir = await this.#packageDirectory(name, version, false);

    if (!dir || !(await hasMarker(dir))) return undefined;

    const manifestHandle = await dir.getFileHandle('package.json');
    const manifestFile = await manifestHandle.getFile();
    const manifest = JSON.parse(await manifestFile.text());

    /** @type {Set<string>} */
    const files = new Set();

    await walk(dir, '', (file) => {
      if (!isMarker(file)) files.add(file);
    });

    return { manifest, files };
  }

  /**
   * Writes the files, then the marker.
   *
   * @param {string} name
   * @param {string} version
   * @param {Contents} contents
   * @returns {Promise<InstalledPackage>}
   */
  async writePackage(name, version, contents) {
    const dir = /** @type {FileSystemDirectoryHandle} */ (
      await this.#packageDirectory(name, version, true)
    );

    /** @type {Set<string>} */
    const files = new Set();

    for (const [path, file] of Object.entries(contents)) {
      const segments = segmentsOf(path);
      const fileName = /** @type {string} */ (segments.pop());
      let parent = dir;

      for (const segment of segments) {
        parent = await parent.getDirectoryHandle(segment, { create: true });
      }

      await writeText(await parent.getFileHandle(fileName, { create: true }), file.text);
      files.add(path);
    }

    await writeText(await dir.getFileHandle(COMPLETE_MARKER, { create: true }), '');

    const manifestFile = contents['package.json'];

    return { manifest: manifestFile ? JSON.parse(manifestFile.text) : { name, version }, files };
  }

  /**
   * @param {string} name
   * @param {string} version
   * @param {boolean} create
   */
  #packageDirectory(name, version, create) {
    return this.#directory(segmentsOf(packageDirectory(name, version)), create);
  }

  /**
   * @param {string[]} segments
   * @param {boolean} create
   * @returns {Promise<undefined | FileSystemDirectoryHandle>}
   */
  async #directory(segments, create) {
    let dir = await this.root;
    let path = '';

    try {
      for (const segment of segments) {
        path = path ? `${path}/${segment}` : segment;

        const known = this.#directories.get(path);

        if (known) {
          dir = known;
          continue;
        }

        dir = await dir.getDirectoryHandle(segment, { create });
        this.#directories.set(path, dir);
      }
    } catch (error) {
      if (isNotFound(error) || isWrongKind(error)) return undefined;

      throw error;
    }

    return dir;
  }

  /**
   * @param {string} path
   * @param {boolean} create
   * @returns {Promise<undefined | FileSystemFileHandle>}
   */
  async #file(path, create) {
    const segments = segmentsOf(path);
    const fileName = segments.pop();

    if (!fileName) return undefined;

    const dir = await this.#directory(segments, create);

    if (!dir) return undefined;

    try {
      return await dir.getFileHandle(fileName, { create });
    } catch (error) {
      if (isNotFound(error) || isWrongKind(error)) return undefined;

      throw error;
    }
  }
}

/**
 * The storage's own bookkeeping, which no reader should see as a file.
 *
 * @param {string} path
 */
function isMarker(path) {
  const name = path.slice(path.lastIndexOf('/') + 1);

  return name === COMPLETE_MARKER || name === LINK_MARKER;
}

/**
 * @param {FileSystemDirectoryHandle} dir
 * @returns {Promise<boolean>}
 */
async function hasMarker(dir) {
  try {
    await dir.getFileHandle(COMPLETE_MARKER);

    return true;
  } catch (error) {
    if (isNotFound(error)) return false;

    throw error;
  }
}

/**
 * @param {FileSystemDirectoryHandle} dir
 * @param {string} prefix
 * @param {(path: string) => void} onFile
 */
async function walk(dir, prefix, onFile) {
  for await (const [entry, handle] of dir.entries()) {
    const path = prefix ? `${prefix}/${entry}` : entry;

    if (handle.kind === 'directory') {
      await walk(/** @type {FileSystemDirectoryHandle} */ (handle), path, onFile);
    } else {
      onFile(path);
    }
  }
}

/**
 * @param {FileSystemFileHandle} handle
 * @param {string} text
 */
async function writeText(handle, text) {
  const withSyncAccess =
    /** @type {{ createSyncAccessHandle?: () => Promise<SyncAccessHandle> }} */ (
      /** @type {unknown} */ (handle)
    );

  if (withSyncAccess.createSyncAccessHandle) {
    const access = await withSyncAccess.createSyncAccessHandle();

    try {
      access.truncate(0);
      access.write(encoder.encode(text));
      access.flush();
    } finally {
      access.close();
    }

    return;
  }

  const writable = await handle.createWritable();

  await writable.write(text);
  await writable.close();
}
