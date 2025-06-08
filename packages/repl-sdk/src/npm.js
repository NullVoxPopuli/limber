import packageNameRegex from 'package-name-regex';

import { cache } from './cache.js';
import { assert } from './utils.js';

/**
 * @type {Map<string, unknown>} namp@version => manifest
 */
const npmInfoCache = new Map();

/**
 * @param {string} name
 * @param {string} version
 */
export async function getNPMInfo(name, version) {
  let key = `${name}@${version}`;

  assert(`Must pass valid npm-compatible package name`, packageNameRegex.test(name));

  let existing = npmInfoCache.get(key);

  if (existing) {
    return existing;
  }

  return cache.cachedPromise(`getNPMInfo:${key}`, async () => {
    assert(`Cannot get data from NPM without specifying the name of the package`, name);
    assert(`Version is required. It may be 'latest'`, version);

    let response = await fetch(`https://registry.npmjs.org/${name}`);
    let json = await response.json();

    npmInfoCache.set(key, json);

    return json;
  });
}

/**
 * @param {any} npmInfo
 * @param {string} requestedVersion
 */
export async function getTarUrl(npmInfo, requestedVersion) {
  let json = npmInfo;

  if (json.error) {
    throw new Error(json.error);
  }

  let tag =
    requestedVersion in json['dist-tags']
      ? json['dist-tags'][requestedVersion]
      : (requestedVersion ?? json['dist-tags'].latest);

  let requested = json.versions[tag];

  return requested.dist.tarball;
}
