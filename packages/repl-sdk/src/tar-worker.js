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
  let key = `${name}@${requestedVersion}`;
  let untarred = cache.tarballs.get(key);

  if (untarred) {
    return untarred;
  }

  let contents = await cache.cachedPromise(`getTar:${key}`, async () => {
    let json = await getNPMInfo(name, requestedVersion);
    let tgzUrl = await getTarUrl(json, requestedVersion);

    let response = await fetch(tgzUrl, {
      headers: {
        ACCEPT: 'application/octet-stream',
      },
    });

    return await untar(await response.arrayBuffer());
  });

  let manifest = JSON.parse(contents['package.json'].text);

  let info = /** @type {import('./types.ts').UntarredPackage}*/ ({ manifest, contents });

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
