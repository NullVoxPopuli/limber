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

/**
 * Generate an import URL for esm.run (jsdelivr)
 *
 * @param {Record<string, string>} versions
 * @param {string} importPath
 */
export function esmRun(versions, importPath) {
  const [name, subPath] = splitSubPath(importPath);

  const version = versions[name];
  const subPathExport = subPath.length === 0 || subPath.startsWith('/') ? subPath : `/${subPath}`;

  return version
    ? `https://esm.run/${name}@latest${subPathExport}`
    : `https://esm.run/${name}${subPathExport}`;
}

export const jsdelivr = {
  /**
   * @param {Record<string, string>} versions
   * @param {string} importPath
   */
  async import(versions, importPath) {
    const url = esmRun(versions, importPath);

    return await import(/* @vite-ignore */ url);
  },
  /**
   * @param {Record<string, string>} versions
   * @param {string[]} deps the names of deps to pull from esm.sh
   */
  async importAll(versions, deps = []) {
    return await Promise.all(
      deps.map((dep) => {
        return jsdelivr.import(versions, dep);
      })
    );
  },
};

export const esmsh = {
  /**
   * @param {Record<string, string>} versions
   * @param {string} importPath
   */
  async import(versions, importPath) {
    const url = esmSh(versions, importPath);

    return await import(/* @vite-ignore */ url);
  },
  /**
   * @param {Record<string, string>} versions
   * @param {string[]} deps the names of deps to pull from esm.sh
   */
  async importAll(versions, deps = []) {
    return await Promise.all(
      deps.map((dep) => {
        return esmsh.import(versions, dep);
      })
    );
  },
};
