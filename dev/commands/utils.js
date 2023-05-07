import latestVersion from 'latest-version';

const VERSION_CACHE = new Map();

async function versionFor(name) {
  if (VERSION_CACHE.has(name)) {
    return VERSION_CACHE.get(name);
  }

  let version = await latestVersion(name);

  VERSION_CACHE.set(name, version);

  return version;
}

export async function latestOfAll(dependencies) {
  let result = {};

  let promises = dependencies.map(async (dep) => {
    return [dep, await versionFor(dep)];
  });

  let resolved = await Promise.all(promises);

  for (let [dep, version] of resolved) {
    result[dep] = `^${version}`;
  }

  return result;
}
