import { parseTar } from 'tarparser';

import { getNPMInfo, getTarUrl } from '../npm.js';

/** @type {Map<string, Promise<import('../types.ts').UntarredPackage>>} */
const inFlight = new Map();

/**
 * Download and unpack a package.
 *
 * Same job as `tar-worker.js`, minus the comlink worker and the global cache,
 * so the spike has one moving part instead of three. The installer takes this
 * as a parameter, so the worker can be swapped back in behind the same
 * signature.
 *
 * @param {string} name
 * @param {string} version npm version or dist-tag
 * @returns {Promise<import('../types.ts').UntarredPackage>}
 */
export function getTar(name, version) {
  const key = `${name}@${version}`;
  const existing = inFlight.get(key);

  if (existing) return existing;

  const promise = download(name, version);

  inFlight.set(key, promise);

  return promise;
}

export function clearTarCache() {
  inFlight.clear();
}

/**
 * @param {string} name
 * @param {string} version
 * @returns {Promise<import('../types.ts').UntarredPackage>}
 */
async function download(name, version) {
  const info = await getNPMInfo(name, version);
  const tgzUrl = await getTarUrl(info, version);

  const response = await fetch(tgzUrl, { headers: { ACCEPT: 'application/octet-stream' } });
  const buffer = await response.arrayBuffer();

  /** @type {{ [name: string]: import('tarparser').FileDescription }} */
  const contents = {};

  for (const file of await parseTar(buffer)) {
    if (file.type !== 'file') continue;

    // every entry is prefixed with `package/`
    contents[file.name.slice(8)] = file;
  }

  const manifestFile = contents['package.json'];

  if (!manifestFile) {
    throw new Error(`${name}@${version} has no package.json`);
  }

  return /** @type {import('../types.ts').UntarredPackage} */ ({
    manifest: JSON.parse(manifestFile.text),
    contents,
  });
}
