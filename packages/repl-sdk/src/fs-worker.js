import { expose } from 'comlink';
import { parseTar } from 'tarparser';

import { Storage } from './fs/storage.js';
import { getNPMInfo, getTarUrl, resolveVersion } from './npm.js';

/**
 * Owns the writes to the file system.
 *
 * Downloads land here, get unpacked straight into storage, and only the
 * manifest and the list of files travel back to the main thread. Writes use
 * sync access handles, which only workers have.
 */
const storage = new Storage();

/** @type {Map<string, Promise<import('./types.ts').InstalledPackage>>} */
const inFlight = new Map();

const EXACT_VERSION = /^\d+\.\d+\.\d+/;

const api = { install, installed, write };

expose(api);

/**
 * Every complete package in storage, as name → versions.
 */
function installed() {
  return storage.installed();
}

/** @type {Map<string, Promise<void>>} */
const writes = new Map();

/**
 * One write at a time per path. A sync access handle is exclusive, and two
 * compiles can target the same file name at once.
 *
 * @param {string} path
 * @param {string} text
 */
function write(path, text) {
  const previous = writes.get(path) ?? Promise.resolve();
  const next = previous.then(
    () => storage.write(path, text),
    () => storage.write(path, text)
  );

  writes.set(path, next);

  return next.finally(() => {
    if (writes.get(path) === next) writes.delete(path);
  });
}

/**
 * Makes sure a package is in storage and describes it.
 *
 * An exact version that is already stored needs no network at all. A range
 * or a tag needs the registry to say which version it means, but the files
 * themselves may still be on disk.
 *
 * @param {string} name
 * @param {string} requestedVersion version, range, or tag
 * @returns {Promise<import('./types.ts').InstalledPackage>}
 */
function install(name, requestedVersion) {
  const key = `${name}@${requestedVersion}`;
  const existing = inFlight.get(key);

  if (existing) return existing;

  const promise = installWorker(name, requestedVersion).finally(() => inFlight.delete(key));

  inFlight.set(key, promise);

  return promise;
}

/**
 * @param {string} name
 * @param {string} requestedVersion
 * @returns {Promise<import('./types.ts').InstalledPackage>}
 */
async function installWorker(name, requestedVersion) {
  if (EXACT_VERSION.test(requestedVersion)) {
    const stored = await storage.readPackage(name, requestedVersion);

    if (stored) return stored;
  }

  const json = await getNPMInfo(name, requestedVersion);
  const version = resolveVersion(json, requestedVersion);

  if (version !== requestedVersion) {
    const stored = await storage.readPackage(name, version);

    if (stored) return stored;
  }

  const tgzUrl = await getTarUrl(json, requestedVersion);
  const response = await fetch(tgzUrl, {
    headers: {
      ACCEPT: 'application/octet-stream',
    },
  });

  return storage.writePackage(name, version, await untar(await response.arrayBuffer()));
}

/**
 * @param {ArrayBuffer} arrayBuffer
 */
async function untar(arrayBuffer) {
  /**
   * @type {{ [name: string]: { text: string } }}
   */
  const contents = {};

  for (const file of await parseTar(arrayBuffer)) {
    if (file.type === 'file') {
      contents[file.name.slice(8)] = file; // remove `package/` prefix
    }
  }

  return contents;
}
