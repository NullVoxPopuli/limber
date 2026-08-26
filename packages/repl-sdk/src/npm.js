import packageNameRegex from 'package-name-regex';

import { cache } from './cache.js';
import { maxSatisfying } from './fs/semver.js';
import { assert } from './utils.js';

/**
 * How long the registry lets a package document be cached (its
 * `cache-control: max-age=300`). Tags and ranges older than this are
 * looked up again; exact versions never change.
 */
export const INDEX_MAX_AGE = 5 * 60 * 1000;

/**
 * Whether a request can be answered by an index of this age.
 *
 * An exact, published version is immutable, so any index that lists it will
 * do. A tag or a range can move when something new is published.
 *
 * @param {import('./fs/opfs-store.js').PackageIndex} index
 * @param {string} requestedVersion
 * @param {number} now
 */
export function indexAnswers(index, requestedVersion, now) {
  if (requestedVersion in index.versions) return true;

  return now - index.fetchedAt < INDEX_MAX_AGE;
}

/**
 * The parts of a registry document that picking a tarball needs. The full
 * document for a package with a long history is megabytes of changelogs and
 * per-version manifests.
 *
 * @param {any} packument
 * @param {number} now
 * @returns {import('./fs/opfs-store.js').PackageIndex}
 */
export function pruneIndex(packument, now) {
  /** @type {import('./fs/opfs-store.js').PackageIndex['versions']} */
  const versions = {};

  for (const [version, entry] of Object.entries(packument.versions ?? {})) {
    versions[version] = { dist: { tarball: /** @type {any} */ (entry).dist.tarball } };
  }

  return {
    name: packument.name,
    fetchedAt: now,
    'dist-tags': packument['dist-tags'] ?? {},
    versions,
  };
}

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

    const response = await fetch(`https://registry.npmjs.org/${name}`, {
      headers: {
        /**
         * The abbreviated document: no readmes or changelogs, still every
         * version with its tarball url.
         */
        accept: 'application/vnd.npm.install-v1+json',
      },
    });
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
