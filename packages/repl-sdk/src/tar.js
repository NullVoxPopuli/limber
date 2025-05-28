import { parseTar } from 'tarparser';

import { getNPMInfo, getTarUrl } from './npm.js';
import { findInTar, Request } from './resolve.js';

/**
 *
 * @type {Map<string, import('./types.ts').UntarredPackage)>} namp@version => untarred data
 */
const tarballCache = new Map();

/**
 * @type {Map<string, unknown>} specifier => fileText
 */
const fileCache = new Map();

/**
 * @param {string} specifier
 * @returns {Promise<{ code: string, ext: string }>}
 */
export async function getFromTarball(specifier) {
  let request = Request.fromSpecifier(specifier);

  if (fileCache.has(request.specifier)) {
    return fileCache.get(request.specifier);
  }

  let untarred = await getTar(request.name, request.version);
  let answer = findInTar(untarred, request);
  let result = getFile(untarred, answer);

  fileCache.set(specifier, result);

  return result;
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {{ inTarFile: string, ext: string }} request
 * @returns {{ code: string, ext: string }}
 */
export function getFile(untarred, answer) {
  let { inTarFile, ext } = answer;

  let code = untarred.contents[inTarFile]?.text;

  if (!code) {
    let { main, module, browser, exports, name } = untarred.manifest;

    console.group(`${name} file info`);
    console.info(`${name} has available: `, exports ?? browser ?? module ?? main);
    console.info(`${name} has these files: `, Object.keys(untarred.contents));
    console.info(`We searched for '${inTarFile}'`);
    console.groupEnd();
  }

  return { code, ext, resolvedAs: inTarFile };
}

/**
 * @param {string} name of the package
 * @param {string} requestedVersion version or tag to fetch the package at
 */
async function getTar(name, requestedVersion) {
  let key = `${name}@${requestedVersion}`;
  let untarred = tarballCache.get(key);

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

  tarballCache.set(key, info);

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
