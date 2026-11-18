import { parseSpecifier } from './specifier.js';
import { deCDN } from './utils.js';

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

/**
 * `@glimdown/babel-8-lite` is not on npm.
 * A host that does not provide it gets the full build, which has the same API.
 *
 * @type {import('./types.ts').Plugin}
 */
export const babel = {
  name: 'repl-sdk:babel',

  resolveId(id) {
    if (deCDN(id) === '@glimdown/babel-8-lite') return `https://esm.sh/@babel/standalone@8`;
  },
};
