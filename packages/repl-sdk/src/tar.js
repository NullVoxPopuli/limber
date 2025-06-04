import { parseTar } from 'tarparser';

import { cache } from './cache.js';
import { getNPMInfo, getTarUrl } from './npm.js';
import { printError, Request, resolve } from './resolve.js';
import { unzippedPrefix } from './utils.js';

/**
 * Resolves the in-tar file from a specifier
 *
 * @param {{ to: string, from: string }}} options
 * @returns {string>} the location in the tar
 */
export function resolveFromTarball({ to, from }) {
  let isRoot = to.match(/^[A-Za-z@]/);
  let request = Request.fromSpecifier(isRoot ? to : `${to}?from=${encodeURIComponent(from)}`);

  cache.requestCache.set(request.key, request);

  return `${unzippedPrefix}/${request.key}`;
}

/**
 * @param {string} unzipped URL
 * @returns {Promise<{ code: string, ext: string }>}
 */
export async function getFromTarball(url) {
  let keyParts = Request.splitKey(url.replace(unzippedPrefix, '').replace(/^\//, ''));
 
  let key = `__name__/${keyParts.name}[AT:V]${keyParts.version}/__to__/${keyParts.path}`;

  if (cache.fileCache.has(key)) {
    return cache.fileCache.get(key);
  }

  if (cache.promiseCache.has(key)) {
    await cache.promiseCache.get(key);
  }

  let request = cache.requestCache.get(key);

  let untarred = await getTar(keyParts.name, keyParts.version);
  let resolveCacheHit = await (async () => {
    let untarred = await getTar(keyParts.name, keyParts.version);
    let answer = resolve(untarred, request);

    return { answer, name: request.name, version: request.version };   
  })();
  let result = getFile(untarred, key, resolveCacheHit.answer);

  cache.fileCache.set(key, result);

  return result;
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {string} key
 * @param {undefined | import('./types.ts').RequestAnswer} answer
 * @returns {{ code: string, ext: string }}
 */
export function getFile(untarred, key, answer) {
  if (!answer) printError(untarred, { original: key }, answer);

  let { inTarFile, ext } = answer;

  let code = untarred.contents[inTarFile]?.text;

  if (!code) printError(untarred, { original: key, answer }, answer);

  return { code, ext, resolvedAs: inTarFile };
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

  let json = await getNPMInfo(name, requestedVersion);
  let tgzUrl = await getTarUrl(json, requestedVersion);

  let response = await fetch(tgzUrl, {
    headers: {
      ACCEPT: 'application/octet-stream',
    },
  });

  let contents = await untar(await response.arrayBuffer());

  let manifest = JSON.parse(contents['package.json'].text);

  let info = { manifest, contents };

  cache.tarballs.set(key, info);

  return info;
}

async function untar(arrayBuffer) {
  const contents = {};

  for (const file of await parseTar(arrayBuffer)) {
    if (file.type === 'file') {
      contents[file.name.slice(8)] = file; // remove `package/` prefix
    }
  }

  return contents;
}
