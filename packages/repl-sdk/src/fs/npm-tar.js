import { wrap } from 'comlink';

/** @type {undefined | { getTar: (name: string, version: string) => Promise<import('../types.ts').UntarredPackage>, clearStore: () => Promise<void> }} */
let com;

/**
 * Lazily, because untarring is the only thing the worker is for and plenty of
 * REPLs never download a package.
 */
function worker() {
  if (com) return com;

  const instance = new Worker(new URL('../tar-worker.js', import.meta.url), {
    name: 'Tar & NPM Downloader Worker',
    type: 'module',
  });

  com = /** @type {NonNullable<typeof com>} */ (/** @type {unknown} */ (wrap(instance)));

  return com;
}

/** @type {Map<string, Promise<import('../types.ts').UntarredPackage>>} */
const inFlight = new Map();

/**
 * Download and unpack a package.
 *
 * The Installer takes this as a parameter rather than importing it, so tests
 * can hand it a fixture instead of the network.
 *
 * @param {string} name
 * @param {string} version npm version or dist-tag
 * @returns {Promise<import('../types.ts').UntarredPackage>}
 */
export function getTar(name, version) {
  const key = `${name}@${version}`;
  const existing = inFlight.get(key);

  if (existing) return existing;

  const promise = worker().getTar(name, version);

  inFlight.set(key, promise);

  return promise;
}

export function clearTarCache() {
  inFlight.clear();
}

/**
 * Forget every package stored on disk. The next import downloads again.
 */
export async function clearStoredTarballs() {
  inFlight.clear();
  await worker().clearStore();
}
