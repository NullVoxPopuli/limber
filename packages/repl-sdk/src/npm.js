/**
 * @type {Map<string, unknown>} namp@version => manifest
 */
const npmInfoCache = new Map();

export async function getNPMInfo(name, version) {
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
