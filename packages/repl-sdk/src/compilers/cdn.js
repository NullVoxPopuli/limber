/**
 * @param {Record<string, string>} versions
 * @param {string} name
 * @param {string} subPath
 */
export function esmSh(versions, name, subPath = '') {
  let version = versions[name];
  let subPathExport = subPath.length === 0 || subPath.startsWith('/') ? subPath : `/${subPath}`;

  return version
    ? `https://esm.sh/${name}@${version}${subPathExport}`
    : `https://esm.sh/${name}${subPathExport}`;
}

/**
 * @param {Record<string, string>} versions
 * @param {string[]} deps the names of deps to pull from esm.sh
 */
export async function getAll(versions, deps = []) {
  return await Promise.all(
    deps.map((depName) => {
      return import(/* vite-ignore */ esmSh(versions, depName));
    })
  );
}
