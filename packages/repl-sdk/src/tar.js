import { untar } from '@andrewbranch/untar.js';

import { parseSpecifier } from './specifier.js';

/**
 * If a package wanted, they could provide a special export condition
 * targeting REPLs.
 *
 * This format should still be ESM.
 */
const CONDITIONS = ['repl', 'module', 'browser', 'import', 'default', 'development'];

/**
 * @type {Map<string, unknown>} namp@version => untarred data
 */
const tarballCache = new Map();

/**
 * @type {Map<string, unknown>} namp@version => manifest
 */
const manifestCache = new Map();

export async function getFromTarball(specifier) {
  let parsed = parseSpecifier(specifier);
  let { name, version = 'latest', path } = parsed;

  /**
   * getTar also populates the package.json in the manifestCache
   */
  let untarred = await getTar(name, version);

  // TODO: refer to package.json.exports for resolving the path
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
  let requested = await getManifest(json, name, requestedVersion);

  let tgzUrl = requested.dist.tarball;

  let response = await fetch(tgzUrl, {
    headers: {
      ACCEPT: 'application/octet-stream',
    },
  });

  console.log('Attempting to untar');

  let files = untar(await response.arrayBuffer());

  console.log({ files: await Promise.all(files.map((f) => f.readAsString())) });
}

async function getManifest(npmInfo, name, requestedVersion) {
  let key = `${name}@${requestedVersion}`;

  if (manifestCache.has(key)) {
    return manifestCache.get(key);
  }

  let json = npmInfo;

  let tag =
    requestedVersion in json['dist-tags']
      ? json['dist-tags'][requestedVersion]
      : (requestedVersion ?? json['dist-tags'].latest);

  let requested = json.versions[tag];

  manifestCache.set(key, requested);

  return requested;
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
