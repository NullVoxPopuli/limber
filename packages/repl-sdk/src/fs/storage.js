/**
 * The file system: the origin private file system, laid out like a project.
 *
 *   /node_modules/<name>@<version>/...   installed packages, unpacked
 *   /src/index.<ext>                     the compiled snippet
 *
 * Paths are absolute and match the path of the file's URL, so a reader that
 * only knows URLs and a reader that only knows the storage agree.
 *
 * Reads work on the main thread and in workers. Writes prefer sync access
 * handles, which every browser has in workers; `createWritable` is the
 * fallback where they are missing.
 *
 * A package is only trusted once its marker file exists, because a reload in
 * the middle of a write leaves the directory half full.
 */
export const NODE_MODULES = 'node_modules';

const COMPLETE_MARKER = '.complete';

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
 * @returns {string} the package's directory, relative to node_modules
 */
export function packageDirectory(name, version) {
  return `${name}@${version}`;
}

/**
 * @param {any} error
 * @returns {boolean}
 */
function isNotFound(error) {
  return error?.name === 'NotFoundError';
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
    const handle = await this.#file(path, false);

    if (!handle) return undefined;

    const file = await handle.getFile();

    return file.text();
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
    return Boolean(await this.#file(path, false));
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
    const dir = await this.#directory(segmentsOf(path), false);

    if (!dir) return [];

    /** @type {string[]} */
    const files = [];

    await walk(dir, `/${segmentsOf(path).join('/')}`, (file) => files.push(file));

    return files;
  }

  async clear() {
    const root = await this.root;

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
    const nodeModules = await this.#directory([NODE_MODULES], false);

    if (!nodeModules) return result;

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

    await collect(nodeModules, '');

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
      if (file !== COMPLETE_MARKER) files.add(file);
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
    return this.#directory(
      segmentsOf(`${NODE_MODULES}/${packageDirectory(name, version)}`),
      create
    );
  }

  /**
   * @param {string[]} segments
   * @param {boolean} create
   * @returns {Promise<undefined | FileSystemDirectoryHandle>}
   */
  async #directory(segments, create) {
    let dir = await this.root;

    try {
      for (const segment of segments) {
        dir = await dir.getDirectoryHandle(segment, { create });
      }
    } catch (error) {
      if (isNotFound(error)) return undefined;

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
      if (isNotFound(error)) return undefined;

      throw error;
    }
  }
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
