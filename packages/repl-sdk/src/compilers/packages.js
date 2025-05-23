/**
 * @param {string} importPath
 */
export function splitSubPath(importPath) {
  if (importPath.startsWith('@')) {
    const [org, name, ...subPaths] = importPath.split('/');

    return [`${org}/${name}`, subPaths.join('/')];
  }

  const [name, ...subPaths] = importPath.split('/');

  return [name, subPaths.join('/')];
}
