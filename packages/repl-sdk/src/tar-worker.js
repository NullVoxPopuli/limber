import { expose } from 'comlink';
import { parseTar } from 'tarparser';

import { cache } from './cache.js';
import { clearStore, readIndex, readTarball, writeIndex, writeTarball } from './fs/opfs-store.js';
import { getNPMInfo, indexAnswers, pruneIndex, resolveVersion } from './npm.js';
import { assert } from './utils.js';

const obj = { getTar, clearStore };

expose(obj);

/**
 * @param {string} name of the package
 * @param {string} requestedVersion version or tag to fetch the package at
 */
async function getTar(name, requestedVersion) {
  const key = `${name}@${requestedVersion}`;
  const untarred = cache.tarballs.get(key);

  if (untarred) {
    return untarred;
  }

  const contents = await cache.cachedPromise(`getTar:${key}`, async () => {
    const index = await getIndex(name, requestedVersion);
    const version = resolveVersion(index, requestedVersion);
    const tarball = index.versions[version]?.dist.tarball;

    assert(`No tarball for ${name}@${version}`, tarball);

    return await untar(await getBytes(name, version, tarball));
  });

  const manifest = JSON.parse(contents['package.json'].text);

  const info = /** @type {import('./types.ts').UntarredPackage}*/ ({ manifest, contents });

  cache.tarballs.set(key, info);

  return info;
}

/**
 * The stored index answers when it can. Exact versions always can; a tag or a
 * range only while the index is younger than the registry's own max-age.
 *
 * @param {string} name
 * @param {string} requestedVersion
 * @returns {Promise<import('./fs/opfs-store.js').PackageIndex>}
 */
async function getIndex(name, requestedVersion) {
  const now = Date.now();
  const stored = await readIndex(name);

  if (stored && indexAnswers(stored, requestedVersion, now)) {
    return stored;
  }

  const index = pruneIndex(await getNPMInfo(name, requestedVersion), now);

  void writeIndex(name, index);

  return index;
}

/**
 * @param {string} name
 * @param {string} version
 * @param {string} url
 * @returns {Promise<ArrayBuffer>}
 */
async function getBytes(name, version, url) {
  const stored = await readTarball(name, version);

  if (stored) return stored;

  const response = await fetch(url, {
    headers: {
      ACCEPT: 'application/octet-stream',
    },
  });

  const bytes = await response.arrayBuffer();

  void writeTarball(name, version, bytes);

  return bytes;
}

/**
 * @param {ArrayBuffer} arrayBuffer
 */
async function untar(arrayBuffer) {
  /**
   * @type {{ [name: string]: import('tarparser').FileDescription }}
   */
  const contents = {};

  for (const file of await parseTar(arrayBuffer)) {
    if (file.type === 'file') {
      contents[file.name.slice(8)] = file; // remove `package/` prefix
    }
  }

  return contents;
}
