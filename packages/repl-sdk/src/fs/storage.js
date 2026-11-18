/**
 * The file system: the origin private file system, laid out like a project.
 *
 *   /node_modules/.deps/<name>@<version>/...   installed packages
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
 * A package is two files: `.pack`, every file of the package one after the
 * other, and the marker, which holds where each file starts and ends in the
 * pack. Firefox takes about 45ms to write one file in the origin private file
 * system, so one file per entry made ember-source's 1186 files a minute long
 * install. Reads under the package directory are slices of the pack, so the
 * paths stay the same and nothing unpacks at boot.
 *
 * A package is only trusted once its marker file exists, because a reload in
 * the middle of a write leaves the directory half full.
 */
export const NODE_MODULES = 'node_modules';
export const DEPS = '.deps';

/**
 * The number goes up when unpacking changes,
 * so a package from an older unpacker installs again.
 *
 * - 2: paths longer than 100 characters, see tar.js
 * - 3: one pack file per package, and the marker is its index
 */
const COMPLETE_MARKER = '.complete-3';
const OLD_MARKERS = new Set(['.complete', '.complete-2']);
const LINK_MARKER = '.link';
const PACK = '.pack';

const encoder = new TextEncoder();

/**
 * @typedef {import('../types.ts').InstalledPackage} InstalledPackage
 * @typedef {Record<string, { text: string }>} Contents
 * @typedef {{ truncate(size: number): void, write(buffer: Uint8Array): number, close(): void }} SyncAccessHandle
 * @typedef {'file' | 'directory'} EntryType
 * @typedef {object} Pack
 * @property {File} file
 * @property {Map<string, [start: number, end: number]>} index by path in the package
 * @property {Map<string, Map<string, EntryType>>} directories by path in the package, `''` for its root
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

/**
 * `/node_modules/.deps/<name>@<version>/<rest>` → the package directory and
 * the rest. Scoped names take two segments.
 *
 * @param {string} path a real path, after links
 * @returns {undefined | { directory: string, rest: string }}
 */
function inPackage(path) {
  const segments = segmentsOf(path);

  if (segments[0] !== NODE_MODULES || segments[1] !== DEPS || segments[2] === undefined) return;

  const length = segments[2].startsWith('@') ? 4 : 3;

  if (segments.length < length) return;

  return {
    directory: `/${segments.slice(0, length).join('/')}`,
    rest: segments.slice(length).join('/'),
  };
}

/**
 * @param {Pack['index']} index
 * @returns {Pack['directories']}
 */
function directoriesOf(index) {
  /** @type {Pack['directories']} */
  const directories = new Map([['', new Map()]]);

  for (const path of index.keys()) {
    const segments = segmentsOf(path);
    let parent = '';

    for (let i = 0; i < segments.length; i++) {
      const name = /** @type {string} */ (segments[i]);
      const isFile = i === segments.length - 1;
      const here = parent ? `${parent}/${name}` : name;

      let children = directories.get(parent);

      if (!children) {
        children = new Map();
        directories.set(parent, children);
      }

      children.set(name, isFile ? 'file' : 'directory');

      if (!isFile && !directories.has(here)) directories.set(here, new Map());

      parent = here;
    }
  }

  return directories;
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
   * Packs already opened, by package directory.
   *
   * An installed version never changes, so the index and the file stay good
   * until this storage removes the package.
   *
   * @type {Map<string, Promise<undefined | Pack>>}
   */
  #packs = new Map();

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
    const real = await this.resolve(path);
    const packed = await this.#packed(real);

    if (packed) return packed.entry && (await packed.blob().text());

    const handle = await this.#file(real, false);

    if (!handle) return undefined;

    const file = await handle.getFile();

    return file.text();
  }

  /**
   * @param {string} path
   * @returns {Promise<undefined | Uint8Array>}
   */
  async readBytes(path) {
    const real = await this.resolve(path);
    const packed = await this.#packed(real);

    if (packed) return packed.entry && new Uint8Array(await packed.blob().arrayBuffer());

    const handle = await this.#file(real, false);

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

    const packed = await this.#packed(real);

    if (packed) {
      const { pack, rest, entry } = packed;

      if (entry) return { type: 'file', size: entry[1] - entry[0], mtime: pack.file.lastModified };
      if (pack.directories.has(rest)) return { type: 'directory', size: 0, mtime: 0 };

      return undefined;
    }

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
    const real = await this.resolve(path);
    const packed = await this.#packed(real);

    if (packed) {
      const children = packed.pack.directories.get(packed.rest);

      if (!children) return undefined;

      return Array.from(children, ([name, type]) => ({ name, type }));
    }

    const dir = await this.#directory(segmentsOf(real), false);

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
    const real = await this.resolve(path);
    const packed = await this.#packed(real);

    if (packed) return Boolean(packed.entry);

    return Boolean(await this.#file(real, false));
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
    this.#packs.clear();

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
    const prefix = `/${segmentsOf(path).join('/')}`;
    const packed = await this.#packed(real);

    if (packed) {
      /** @type {string[]} */
      const files = [];
      const within = packed.rest ? `${packed.rest}/` : '';

      for (const file of packed.pack.index.keys()) {
        if (file.startsWith(within)) files.push(`${prefix}/${file.slice(within.length)}`);
      }

      return files;
    }

    const dir = await this.#directory(segmentsOf(real), false);

    if (!dir) return [];

    /** @type {string[]} */
    const files = [];

    /** @type {string[]} */
    const packs = [];

    await walk(dir, prefix, (file) => {
      if (file.endsWith(`/${COMPLETE_MARKER}`)) {
        packs.push(file.slice(0, -COMPLETE_MARKER.length - 1));
      } else if (!isMarker(file)) {
        files.push(file);
      }
    });

    for (const pack of packs) {
      for (const file of await this.list(pack)) files.push(file);
    }

    return files;
  }

  async clear() {
    const root = await this.root;

    this.#directories.clear();
    this.#packs.clear();

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
    const directory = packageDirectory(name, version);
    const pack = await this.#pack(directory);

    if (!pack) return undefined;

    const manifest = JSON.parse((await this.read(`${directory}/package.json`)) ?? '{}');

    return { manifest, files: new Set(pack.index.keys()) };
  }

  /**
   * Writes the pack, then the marker with the index.
   *
   * A directory from an older unpacker is removed first, so its loose files
   * are not left next to the pack.
   *
   * @param {string} name
   * @param {string} version
   * @param {Contents} contents
   * @returns {Promise<InstalledPackage>}
   */
  async writePackage(name, version, contents) {
    const directory = packageDirectory(name, version);

    await this.remove(directory);

    const dir = /** @type {FileSystemDirectoryHandle} */ (
      await this.#directory(segmentsOf(directory), true)
    );

    /** @type {Record<string, [start: number, end: number]>} */
    const index = {};
    /** @type {Uint8Array[]} */
    const chunks = [];
    let size = 0;

    for (const [path, file] of Object.entries(contents)) {
      const bytes = encoder.encode(file.text);

      index[path] = [size, size + bytes.length];
      chunks.push(bytes);
      size += bytes.length;
    }

    const pack = new Uint8Array(size);

    for (let i = 0, offset = 0; i < chunks.length; i++) {
      const chunk = /** @type {Uint8Array} */ (chunks[i]);

      pack.set(chunk, offset);
      offset += chunk.length;
    }

    await writeBytes(await dir.getFileHandle(PACK, { create: true }), pack);
    await writeBytes(
      await dir.getFileHandle(COMPLETE_MARKER, { create: true }),
      encoder.encode(JSON.stringify(index))
    );

    const files = new Set(Object.keys(index));

    const manifestFile = contents['package.json'];

    return { manifest: manifestFile ? JSON.parse(manifestFile.text) : { name, version }, files };
  }

  /**
   * The pack a real path is in, and the path's entry in it.
   * Undefined when the path is not in a complete package.
   *
   * @param {string} real
   */
  async #packed(real) {
    const where = inPackage(real);

    if (!where) return undefined;

    const pack = await this.#pack(where.directory);

    if (!pack) return undefined;

    const entry = pack.index.get(where.rest);

    return {
      pack,
      rest: where.rest,
      entry,
      blob: () => {
        const [start, end] = /** @type {[number, number]} */ (entry);

        return pack.file.slice(start, end);
      },
    };
  }

  /**
   * A miss is not kept, because the worker can finish the install a moment later.
   *
   * @param {string} directory
   * @returns {Promise<undefined | Pack>}
   */
  #pack(directory) {
    const known = this.#packs.get(directory);

    if (known) return known;

    const opening = this.#openPack(directory);

    this.#packs.set(directory, opening);

    const forget = () => {
      if (this.#packs.get(directory) === opening) this.#packs.delete(directory);
    };

    opening.then((pack) => pack || forget(), forget);

    return opening;
  }

  /**
   * @param {string} directory
   * @returns {Promise<undefined | Pack>}
   */
  async #openPack(directory) {
    const marker = await this.#file(`${directory}/${COMPLETE_MARKER}`, false);

    if (!marker) return undefined;

    const packHandle = await this.#file(`${directory}/${PACK}`, false);

    if (!packHandle) return undefined;

    /** @type {Record<string, [number, number]>} */
    const entries = JSON.parse(await (await marker.getFile()).text());
    const index = new Map(Object.entries(entries));

    return { file: await packHandle.getFile(), index, directories: directoriesOf(index) };
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

  return name === COMPLETE_MARKER || name === LINK_MARKER || name === PACK || OLD_MARKERS.has(name);
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
function writeText(handle, text) {
  return writeBytes(handle, encoder.encode(text));
}

/**
 * @param {FileSystemFileHandle} handle
 * @param {Uint8Array} bytes
 */
async function writeBytes(handle, bytes) {
  const withSyncAccess =
    /** @type {{ createSyncAccessHandle?: () => Promise<SyncAccessHandle> }} */ (
      /** @type {unknown} */ (handle)
    );

  if (withSyncAccess.createSyncAccessHandle) {
    const access = await withSyncAccess.createSyncAccessHandle();

    try {
      access.truncate(0);
      access.write(bytes);
    } finally {
      access.close();
    }

    return;
  }

  const writable = await handle.createWritable();

  await writable.write(/** @type {BufferSource} */ (bytes));
  await writable.close();
}
