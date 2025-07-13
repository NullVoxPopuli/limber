/**
 * Parses
 *   @scope/pkgName
 *   pkgName
 *   @scope/pkgName@version
 *   pkgName@version
 *   @scope/pkgName@version/path
 *   pkgName@version/path
 *
 * @param {string} specifier
 * @returns {{ name: string, version: string | undefined, path: string }}
 */
export function parseSpecifier(specifier) {
  let name = '';
  let version = '';
  let path = '.';

  const chars = specifier.split('');

  const hasScope = chars[0] === '@';

  let isVersion = false;
  let isPath = false;
  let finishedName = false;
  let slashCount = 0;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // Enter version mode
    // Goes until the end, or a slash
    if (char === '@' && i > 0) {
      finishedName = true;
      isVersion = true;
      continue;
    } else if (char === '/') {
      slashCount++;

      if (hasScope) {
        if (slashCount > 1) {
          finishedName = true;
        }
      } else {
        finishedName = true;
      }

      if (finishedName) {
        isPath = true;
      }
    }

    if (isVersion && char === '/') {
      isVersion = false;
      isPath = true;
    }

    if (isVersion) {
      version += char;
    } else if (isPath) {
      path += char;
    } else {
      name += char;
    }
  }

  return {
    name,
    version: version || undefined,
    path,
  };
}
