import { parseSpecifier } from './specifier.js';

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
}

async function getTar(name, version) {
  let key = `${name}@${version}`;
  let untarred = tarballCache.get(key);

  if (untarred) {
    return untarred;
  }

  let json = await getNPMInfo(name, version);

  let tag = version ?? json['dist-tags'].latest;
  let requested = json.versions[tag];

  manifestCache.set(key, requested);

  let tgzUrl = requested.dist.tarball;

  let response = await fetch(tgzUrl);
  let blob = await response.blob();

  console.log(blob);
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
