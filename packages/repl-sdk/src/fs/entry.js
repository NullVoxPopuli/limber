import { SRC_PREFIX } from './url.js';

/**
 * Monotonic for the life of the page, deliberately.
 *
 * es-module-shims keys its module registry by URL and there is no way to
 * evict from it, so importing the same URL hands back the module that URL
 * already evaluated to. The file keeps its name; the query is what makes each
 * compile a new module.
 */
let revision = 0;

/**
 * Text waiting to be imported, by its revisioned URL.
 *
 * Two compiles of the same file can be in flight, one per keystroke, and the
 * file on disk can only hold one of them. The loader gets the text it was
 * promised from here; the file is what the last compile wrote.
 *
 * @type {Map<string, string>}
 */
const pending = new Map();

/**
 * Give the compiled snippet a home: `/src/index.<ext>`.
 *
 * It used to be a blob URL, which is why `import './other.gjs'` from a
 * snippet could never work: the parent URL said nothing about where the
 * snippet lived, so there was nothing to resolve a sibling against.
 *
 * @param {Pick<import('./worker.js').FsWorker, 'write'>} worker
 * @param {string} fileName
 * @param {string} source
 * @returns {Promise<string>} the URL to import
 */
export async function writeEntry(worker, fileName, source) {
  revision += 1;

  const url = `${SRC_PREFIX}${fileName}?v=${revision}`;

  pending.set(url, source);
  await worker.write(`/src/${fileName}`, source);

  return url;
}

/**
 * The text a revisioned URL was written with, once. Later imports of the same
 * URL never reach the source hook, because the loader keeps the module.
 *
 * @param {string} url
 * @returns {undefined | string}
 */
export function takeEntry(url) {
  const source = pending.get(url);

  pending.delete(url);

  return source;
}
