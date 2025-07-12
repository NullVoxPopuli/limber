import { expose } from 'comlink';
import { parseTar } from 'tarparser';

import { cache } from './cache.js';
import { getNPMInfo, getTarUrl } from './npm.js';

const obj = { getTar };

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
    const json = await getNPMInfo(name, requestedVersion);
    const tgzUrl = await getTarUrl(json, requestedVersion);

    const response = await fetch(tgzUrl, {
      headers: {
        ACCEPT: 'application/octet-stream',
      },
    });

    return await untar(await response.arrayBuffer());
  });

  const manifest = JSON.parse(contents['package.json'].text);

  const info = /** @type {import('./types.ts').UntarredPackage}*/ ({ manifest, contents });

  cache.tarballs.set(key, info);

  return info;
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
