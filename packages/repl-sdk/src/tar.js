/**
 * @type {Map<string, unknown>} namp@version => untarred data
 */
const tarballCache = new Map();

export function getFromTarball(specifier) {
  return tarballCache.get(`${name}@${version}`);
}
