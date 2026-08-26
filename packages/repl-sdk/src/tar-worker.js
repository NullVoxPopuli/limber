import { expose } from 'comlink';
import { parseTar } from 'tarparser';

import { clearStore, openPack, readIndex, writeIndex, writePack } from './fs/opfs-store.js';
import { fetchPackument, indexAnswers, pruneIndex, resolveVersion } from './npm.js';
import { assert } from './utils.js';

const obj = { getTar, clearStore };

expose(obj);

/**
 * The manifest and file list of a package, stored on disk on the way.
 *
 * File bodies only travel back when the store could not take them, which
 * is how a browser without OPFS still works.
 *
 * @param {string} name of the package
 * @param {string} requestedVersion version or tag to fetch the package at
 * @returns {Promise<import('./types.ts').UntarredPackage>}
 */
async function getTar(name, requestedVersion) {
  const index = await getIndex(name, requestedVersion);
  const version = resolveVersion(index, requestedVersion);
  const tarball = index.versions[version]?.dist.tarball;

  assert(`No tarball for ${name}@${version}`, tarball);

  const stored = await openPack(name, version);

  if (stored) {
    const manifest = await readFromPack(stored, 'package.json');

    assert(`${name}@${version} is stored without a package.json`, manifest);

    return { manifest: JSON.parse(manifest), files: Object.keys(stored.files) };
  }

  const response = await fetch(tarball, {
    headers: {
      ACCEPT: 'application/octet-stream',
    },
  });

  const entries = await untar(await response.arrayBuffer());
  const packageJson = entries.find((entry) => entry.path === 'package.json');

  assert(`${name}@${version} has no package.json`, packageJson);

  const manifest = JSON.parse(new TextDecoder().decode(packageJson.data));
  const files = entries.map((entry) => entry.path);
  const written = await writePack(name, version, entries);

  if (written) return { manifest, files };

  /** @type {{ [path: string]: { text: string } }} */
  const contents = {};

  for (const { path, data } of entries) {
    contents[path] = { text: new TextDecoder().decode(data) };
  }

  return { manifest, files, contents };
}

/**
 * @param {import('./fs/opfs-store.js').Pack} pack
 * @param {string} path
 */
async function readFromPack(pack, path) {
  const range = pack.files[path];

  if (!range) return;

  const [offset, length] = range;

  return pack.blob.slice(offset, offset + length).text();
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

  const index = pruneIndex(await fetchPackument(name), now);

  void writeIndex(name, index);

  return index;
}

/**
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<{ path: string, data: Uint8Array<ArrayBuffer> }[]>}
 */
async function untar(arrayBuffer) {
  /** @type {{ path: string, data: Uint8Array<ArrayBuffer> }[]} */
  const entries = [];

  for (const file of await parseTar(arrayBuffer)) {
    if (file.type === 'file') {
      // remove `package/` prefix
      entries.push({
        path: file.name.slice(8),
        data: /** @type {Uint8Array<ArrayBuffer>} */ (file.data),
      });
    }
  }

  return entries;
}
