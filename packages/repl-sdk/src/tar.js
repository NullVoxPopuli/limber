import { wrap } from 'comlink';

import { cache } from './cache.js';
import { Request } from './request.js';
import { printError, resolve } from './resolve.js';
import { assert, unzippedPrefix } from './utils.js';

const worker = new Worker(new URL('./tar-worker.js', import.meta.url), {
  name: 'Tar & NPM Downloader Worker',
  type: 'module',
});
const com = wrap(worker);

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
    let untarred = await com.getTar(request.name, request.version);
    let answer = resolve(untarred, request);

    if (!answer) {
      throw new Error(`Could not find file for ${request.original}`);
    }

    return { answer, name: request.name, version: request.version };
  });

  let untarred = await com.getTar(request.name, request.version);

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
function getFile(untarred, key, answer) {
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
