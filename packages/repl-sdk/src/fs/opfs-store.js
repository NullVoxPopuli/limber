/**
 * Persistent storage for downloaded packages, in the Origin Private File
 * System, so a reload does not download again.
 *
 * Two kinds of file live under one directory:
 *
 *   repl-sdk/tarballs/<name>/<version>.tgz   the bytes npm served, immutable
 *   repl-sdk/index/<name>.json               dist-tags and versions, small
 *
 * Every method is a no-op that resolves to `undefined` when OPFS is missing,
 * so callers fall through to the network without checking.
 */

const ROOT = 'repl-sdk';

/**
 * @typedef {{
 *   name: string,
 *   fetchedAt: number,
 *   'dist-tags': { [tag: string]: string },
 *   versions: { [version: string]: { dist: { tarball: string } } },
 * }} PackageIndex
 */

/**
 * @typedef {{ createSyncAccessHandle?: () => Promise<{
 *   truncate: (size: number) => void,
 *   write: (bytes: ArrayBuffer | Uint8Array<ArrayBuffer>) => number,
 *   flush: () => void,
 *   close: () => void,
 * }> }} MaybeSyncHandle
 */

/** @type {Promise<FileSystemDirectoryHandle | undefined> | undefined} */
let rootPromise;

function root() {
  rootPromise ||= (async () => {
    try {
      const origin = await navigator.storage?.getDirectory();

      return await origin?.getDirectoryHandle(ROOT, { create: true });
    } catch {
      return undefined;
    }
  })();

  return rootPromise;
}

/**
 * @param {string[]} segments
 * @param {{ create: boolean }} options
 * @returns {Promise<FileSystemDirectoryHandle | undefined>}
 */
async function directory(segments, options) {
  let dir = await root();

  for (const segment of segments) {
    if (!dir) return;

    try {
      dir = await dir.getDirectoryHandle(segment, options);
    } catch {
      return;
    }
  }

  return dir;
}

/**
 * @param {string[]} dirSegments
 * @param {string} fileName
 * @returns {Promise<ArrayBuffer | undefined>}
 */
async function readFile(dirSegments, fileName) {
  const dir = await directory(dirSegments, { create: false });

  if (!dir) return;

  try {
    const handle = await dir.getFileHandle(fileName);
    const file = await handle.getFile();

    return await file.arrayBuffer();
  } catch {
    return;
  }
}

/**
 * Best effort. Another tab may hold the file, or the quota may be full.
 * Either way the caller has the bytes it needs in memory already.
 *
 * @param {string[]} dirSegments
 * @param {string} fileName
 * @param {ArrayBuffer | Uint8Array<ArrayBuffer>} bytes
 */
async function writeFile(dirSegments, fileName, bytes) {
  const dir = await directory(dirSegments, { create: true });

  if (!dir) return;

  try {
    const handle = await dir.getFileHandle(fileName, { create: true });

    /**
     * Sync access handles only exist in dedicated workers, which is where
     * tarballs are downloaded, and only the webworker lib declares them.
     * `createWritable` covers the main thread.
     *
     */
    const worker = /** @type {MaybeSyncHandle} */ (/** @type {unknown} */ (handle));

    if (worker.createSyncAccessHandle) {
      const access = await worker.createSyncAccessHandle();

      try {
        access.truncate(0);
        access.write(bytes);
        access.flush();
      } finally {
        access.close();
      }

      return;
    }

    const writable = await handle.createWritable();

    await writable.write(bytes);
    await writable.close();
  } catch {
    return;
  }
}

/**
 * Scoped names have a slash, and a slash is a directory.
 *
 * @param {string} name
 */
function nameSegments(name) {
  return name.split('/');
}

/**
 * @param {string} name
 * @param {string} version an exact, published version
 * @returns {Promise<ArrayBuffer | undefined>}
 */
export function readTarball(name, version) {
  return readFile(['tarballs', ...nameSegments(name)], `${version}.tgz`);
}

/**
 * @param {string} name
 * @param {string} version an exact, published version
 * @param {ArrayBuffer} bytes
 */
export function writeTarball(name, version, bytes) {
  return writeFile(['tarballs', ...nameSegments(name)], `${version}.tgz`, bytes);
}

/**
 * @param {string} name
 * @returns {Promise<PackageIndex | undefined>}
 */
export async function readIndex(name) {
  const segments = nameSegments(name);
  const file = /** @type {string} */ (segments.pop());
  const bytes = await readFile(['index', ...segments], `${file}.json`);

  if (!bytes) return;

  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return;
  }
}

/**
 * @param {string} name
 * @param {PackageIndex} index
 */
export function writeIndex(name, index) {
  const segments = nameSegments(name);
  const file = /** @type {string} */ (segments.pop());

  return writeFile(
    ['index', ...segments],
    `${file}.json`,
    new TextEncoder().encode(JSON.stringify(index))
  );
}

/**
 * Remove everything this module ever wrote.
 */
export async function clearStore() {
  try {
    const origin = await navigator.storage?.getDirectory();

    await origin?.removeEntry(ROOT, { recursive: true });
  } catch {
    return;
  } finally {
    rootPromise = undefined;
  }
}
