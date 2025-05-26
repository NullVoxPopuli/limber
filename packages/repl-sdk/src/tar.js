import { exports as resolveExports } from 'resolve.exports';
import { parseTar } from 'tarparser';

import { parseSpecifier } from './specifier.js';

/**
 * If a package wanted, they could provide a special export condition
 * targeting REPLs.
 *
 * This format should still be ESM.
 */
const CONDITIONS = ['repl', 'module', 'browser', 'import', 'default', 'development'];
const RESOLVE_VIA = ['exports', 'module', 'browser', 'main'];

/**
 *
 * @type {Map<string, import('./types.ts').UntarredPackage)>} namp@version => untarred data
 */
const tarballCache = new Map();

/**
 * @type {Map<string, unknown>} specifier => fileText
 */
const fileCache = new Map();

export async function getFromTarball(specifier) {
  if (fileCache.has(specifier)) {
    return fileCache.get(specifier);
  }

  let parsed = parseSpecifier(specifier);
  let { name, version = 'latest', path } = parsed;

  /**
   * getTar also populates the package.json in the manifestCache
   */
  let untarred = await getTar(name, version);

  let result = resolve(untarred, path);

  fileCache.set(specifier, result);

  return result;
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {string} path
 */
function resolve(untarred, path) {
  let { main, module, browser, exports, name } = untarred.manifest;

  for (let manifiestField of RESOLVE_VIA) {
    let result = resolveVia(untarred.manifest, path, manifiestField);

    if (result) return result;
  }

  // Super fallback, just see if we can find the file...
  // This may be stupid, because not even node allows for this.
  //
  // Extensions will be required for this to work though
  let toFind = path.replace(/^\.\//, '');
  let file = untarred.contents[toFind]?.text;

  if (!file) {
    console.group(`${name} file info`);
    console.info(`${name} has available: `, exports ?? browser ?? module ?? main);
    console.info(`${name} has these files: `, Object.keys(untarred.contents));
    console.info(`We searched for '${toFind}'`);
    console.groupEnd();
    throw new Error(`Could not resolve \`${path}\` in ${name}`);
  }

  return file;
}

/**
 * @param {import('./types.ts').UntarredPackage['manifest']} manifest
 * @param {string} path
 * @param {'exports' | 'module' | 'browser' | 'main'} manifiestField
 */
function resolveVia(manifest, path, manifiestField) {
  let target = manifest[manifiestField];

  if (!target) return;

  if (typeof target === 'string') {
    return target;
  }

  if (typeof target === 'object') {
    debugger;

    return resolveExports(manifest, path, {
      conditions: CONDITIONS,
    });
  }
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
  let tgzUrl = await getTarUrl(json, name, requestedVersion);

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

async function getTarUrl(npmInfo, name, requestedVersion) {
  let json = npmInfo;

  let tag =
    requestedVersion in json['dist-tags']
      ? json['dist-tags'][requestedVersion]
      : (requestedVersion ?? json['dist-tags'].latest);

  let requested = json.versions[tag];

  return requested.dist.tarball;
}

/**
 * @type {Map<string, unknown>} namp@version => manifest
 */
const npmInfoCache = new Map();

async function getNPMInfo(name, version) {
  let key = `${name}@${version}`;

  let existing = npmInfoCache.get(key);

  if (existing) {
    return existing;
  }

  let response = await fetch(`https://registry.npmjs.org/${name}`);
  let json = await response.json();

  npmInfoCache.set(key, json);

  return json;
}
