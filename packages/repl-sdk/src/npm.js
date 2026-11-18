import packageNameRegex from 'package-name-regex';

import { cache } from './cache.js';
import { maxSatisfying } from './fs/semver.js';
import { assert } from './utils.js';

/**
 * The registry answers with the document of the whole package,
 * so one fetch serves every version and range of it.
 *
 * @param {string} name
 */
export async function getNPMInfo(name) {
  assert(`Must pass valid npm-compatible package name`, packageNameRegex.test(name));

  return cache.cachedPromise(`getNPMInfo:${name}`, async () => {
    const response = await fetch(`https://registry.npmjs.org/${name}`);

    return response.json();
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
