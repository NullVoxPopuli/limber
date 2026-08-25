export const PROJECT_PREFIX = 'file:///project/';

/**
 * Monotonic for the life of the page, deliberately.
 *
 * es-module-shims keys its module registry by URL and there is no way to
 * evict from it, so reusing a URL hands back the module that URL already
 * evaluated to. That is the one thing blob URLs were providing here, and
 * clearing it along with the rest of the caches is how a REPL ends up
 * rendering the previous demo.
 */
let revision = 0;

/**
 * Give the compiled snippet a home.
 *
 * It used to be a blob URL, which is why the debug log was full of them and
 * why `import './other.gjs'` from a snippet could never work: the parent URL
 * said nothing about where the snippet lived, so there was nothing to resolve
 * a sibling against.
 *
 * @param {import('./vfs.js').VFS} vfs
 * @param {string} fileName
 * @param {string} source
 * @returns {string}
 */
export function writeEntry(vfs, fileName, source) {
  revision += 1;

  const url = `${PROJECT_PREFIX}${revision}/${fileName}`;

  /**
   * Always js: whatever the format was, a compiler has already turned it into
   * a module. A `.ts` fileName would otherwise ask for a transform that has
   * already happened.
   */
  vfs.write(url, source, 'js');

  return url;
}

/**
 * Drop the source once the module exists, which is what `revokeBlobURLs` did
 * for the blob this replaces. Nothing reads a module's source after it has
 * been instantiated.
 *
 * @param {import('./vfs.js').VFS} vfs
 * @param {string} url
 */
export function releaseEntry(vfs, url) {
  vfs.delete(url);
}
