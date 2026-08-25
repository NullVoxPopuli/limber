import packageNameRegex from 'package-name-regex';

import { cache } from './cache.js';
import { maxSatisfying } from './fs/semver.js';
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
  const key = `${name}@${version}`;

  assert(`Must pass valid npm-compatible package name`, packageNameRegex.test(name));

  const existing = npmInfoCache.get(key);

  if (existing) {
    return existing;
  }

  return cache.cachedPromise(`getNPMInfo:${key}`, async () => {
    assert(`Cannot get data from NPM without specifying the name of the package`, name);
    assert(`Version is required. It may be 'latest'`, version);

    const response = await fetch(`https://registry.npmjs.org/${name}`);
    const json = await response.json();

    npmInfoCache.set(key, json);

    return json;
  });
}

/**
 * Pick a published version for a dist-tag, an exact version, or a range.
 *
 * Ranges matter because dependency versions come from the package.json of
 * whatever depends on them, and those are written as ranges.
 *
 * @param {any} npmInfo
 * @param {string} requestedVersion
 * @returns {string}
 */
export function resolveVersion(npmInfo, requestedVersion) {
  const json = npmInfo;

  if (json.error) {
    throw new Error(json.error);
  }

  if (!requestedVersion) return json['dist-tags'].latest;
  if (requestedVersion in json['dist-tags']) return json['dist-tags'][requestedVersion];
  if (requestedVersion in json.versions) return requestedVersion;

  const match = maxSatisfying(Object.keys(json.versions), requestedVersion);

  assert(`No published version of ${json.name} matches ${requestedVersion}`, match);

  return match;
}

/**
 * @param {any} npmInfo
 * @param {string} requestedVersion
 */
export async function getTarUrl(npmInfo, requestedVersion) {
  const version = resolveVersion(npmInfo, requestedVersion);

  return npmInfo.versions[version].dist.tarball;
}
