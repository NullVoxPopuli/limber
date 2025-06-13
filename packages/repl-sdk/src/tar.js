import { parseTar } from 'tarparser';

import { cache } from './cache.js';
import { getNPMInfo, getTarUrl } from './npm.js';
import { Request } from './request.js';
import { printError, resolve } from './resolve.js';
import { assert, unzippedPrefix } from './utils.js';

/**
 * @param {string} url request URL
 * @returns {Promise<undefined | { code: string, ext: string }>}
 */
export async function getFromTarball(url) {
  const key = url.replace(unzippedPrefix + '/', '');
  const request = cache.requestCache.get(key);

  assert(`Missing request for ${url}`, request);

  if (cache.fileCache.has(key)) {
    return cache.fileCache.get(key);
  }

  let data = await cache.cachedPromise(key, async () => {
    let untarred = await getTar(request.name, request.version);
    let answer = resolve(untarred, request);

    if (!answer) {
      throw new Error(`Could not find file for ${request.original}`);
    }

    return { answer, name: request.name, version: request.version };
  });

  let untarred = await getTar(request.name, request.version);

  let result = getFile(untarred, key, data.answer);

  assert(`Missing file for ${url}`, result);

  cache.fileCache.set(key, result);

  return result;
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {string} key
 * @param {undefined | import('./types.ts').RequestAnswer} answer
 * @returns {undefined | { code: string, ext: string }}
 */
export function getFile(untarred, key, answer) {
  let request = Request.fromRequestId(key);

  if (!answer) {
    printError(untarred, request, answer);

    return;
  }

  let { inTarFile, ext } = answer;

  let code = untarred.contents[inTarFile]?.text;

  if (!code) {
    printError(untarred, request, answer);

    return;
  }

  return { code, ext };
}

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
