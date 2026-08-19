/**
 * Paths in a Project are always relative to the project root,
 * with no leading slash and no leading `./`.
 *
 * @param {string} path
 * @returns {string}
 */
export function normalize(path) {
  let result = String(path).trim().replaceAll('\\', '/');

  while (result.startsWith('./')) {
    result = result.slice(2);
  }

  while (result.startsWith('/')) {
    result = result.slice(1);
  }

  return result.replaceAll(/\/{2,}/g, '/');
}

/**
 * @param {string} path
 * @returns {string}
 */
export function basename(path) {
  const parts = normalize(path).split('/');

  return parts[parts.length - 1] ?? '';
}

/**
 * @param {string} path
 * @returns {string}
 */
export function dirname(path) {
  const parts = normalize(path).split('/');

  parts.pop();

  return parts.join('/');
}

/**
 * The extension, without the dot. Empty string when there isn't one.
 *
 * Dotfiles have no extension: `.gitignore` is a name, not an extension.
 *
 * @param {string} path
 * @returns {string}
 */
export function extname(path) {
  const name = basename(path);
  const index = name.lastIndexOf('.');

  if (index <= 0) return '';

  return name.slice(index + 1);
}
