import { parseSpecifier } from './specifier.js';

/**
 * @param {string} importPath
 * @returns {[string, string]}
 */
function splitSubPath(importPath) {
  const parsed = parseSpecifier(importPath);

  return [parsed.name, parsed.path === '.' ? '' : parsed.path];
}

/**
 * Generate an import URL for esm.sh
 *
 * @param {Record<string, string>} versions
 * @param {string} importPath
 */
export function esmSh(versions, importPath, allExternal = false) {
  const [name, subPath] = splitSubPath(importPath);

  const version = versions[name];
  const subPathExport = subPath.length === 0 || subPath.startsWith('/') ? subPath : `/${subPath}`;

  const externals = allExternal ? '*' : '';

  return version
    ? `https://esm.sh/${externals}${name}@${version}${subPathExport}`
    : `https://esm.sh/${externals}${name}${subPathExport}`;
}
