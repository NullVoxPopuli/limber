import { splitSubPath } from './packages.js';

/**
 * Generate an import URL for esm.sh
 *
 * @param {Record<string, string>} versions
 * @param {string} importPath
 * @param {string} subPath
 */
export function esmSh(versions, importPath) {
  let [name, subPath] = splitSubPath(importPath);

  let version = versions[name];
  let subPathExport = subPath.length === 0 || subPath.startsWith('/') ? subPath : `/${subPath}`;

  return version
    ? `https://esm.sh/${name}@${version}${subPathExport}`
    : `https://esm.sh/${name}${subPathExport}`;
}

/**
 * Generate an import URL for esm.run (jsdelivr)
 *
 * @param {Record<string, string>} versions
 * @param {string} importPath
 * @param {string} subPath
 */
export function esmRun(versions, importPath) {
  let [name, subPath] = splitSubPath(importPath);

  let version = versions[name];
  let subPathExport = subPath.length === 0 || subPath.startsWith('/') ? subPath : `/${subPath}`;

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
    let url = esmRun(versions, importPath);

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
    let url = esmSh(versions, importPath);

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
