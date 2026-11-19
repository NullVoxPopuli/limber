import { SRC_PREFIX } from './url.js';

/**
 * Monotonic for the life of the page, deliberately.
 *
 * es-module-shims keys its module registry by URL and there is no way to
 * evict from it, so importing the same URL hands back the module that URL
 * already evaluated to. The revision is a folder, not a query, so that every
 * relative import of a project inherits it: one edit reloads every file of
 * the project, and the packages that it imports stay cached.
 *
 *   file:///src/@3/index.gjs  imports './button.gjs'  →  file:///src/@3/button.gjs
 */
let revision = 0;

/**
 * @typedef {object} ProjectFile
 * @property {string} source
 * @property {boolean} compiled false for a file that a compiler must still turn into a module
 */

/**
 * The files of each project that is still loading, by revision, then by path
 * relative to `/src/`.
 *
 * Two compiles can be in flight, one per keystroke, and the file on disk can
 * only hold one of them. The loader gets the text it was promised from here.
 *
 * @type {Map<number, Map<string, ProjectFile>>}
 */
const projects = new Map();

/**
 * The newest project that finished loading. Its files stay, because a module
 * can `import()` a sibling long after the compile is done.
 */
let retained = 0;

const REVISIONED = /^file:\/\/\/src\/@(\d+)\/(.*)$/;

/**
 * Give the compiled snippet a home: `/src/@<revision>/index.<ext>`,
 * next to the other files of its project.
 *
 * @param {Pick<import('./worker.js').FsWorker, 'write'>} worker
 * @param {string} fileName
 * @param {string} source the compiled entry
 * @param {Record<string, string>} [files] the other files, as path → text that is not compiled yet
 * @returns {Promise<{ url: string, revision: number }>}
 */
export async function writeEntry(worker, fileName, source, files = {}) {
  revision += 1;

  const current = revision;
  /** @type {Map<string, ProjectFile>} */
  const project = new Map();

  for (const [path, text] of Object.entries(files)) {
    project.set(normalize(path), { source: text, compiled: false });
  }

  project.set(fileName, { source, compiled: true });
  projects.set(current, project);

  /**
   * Storage is for people who read it, so it has what they wrote,
   * and the entry as it ran.
   */
  await Promise.all(
    Array.from(project, ([path, file]) => worker.write(`/src/${path}`, file.source))
  );

  return { url: `${SRC_PREFIX}@${current}/${fileName}`, revision: current };
}

/**
 * Called when the import of a project settles.
 *
 * @param {number} done
 */
export function releaseEntry(done) {
  if (done > retained) {
    projects.delete(retained);
    retained = done;

    return;
  }

  projects.delete(done);
}

/**
 * The file that a URL under `/src/` names, from the project it belongs to.
 *
 * @param {string} url
 * @returns {undefined | ProjectFile & { path: string, revision: number }}
 */
export function takeEntry(url) {
  const match = REVISIONED.exec(url);

  if (!match) return;

  const [, rev, path = ''] = match;
  const revision = Number(rev);
  const file = projects.get(revision)?.get(path);

  if (!file) return;

  return { ...file, path, revision };
}

/**
 * @param {string} url
 */
export function isRevisioned(url) {
  return REVISIONED.test(url);
}

/**
 * The path in storage of a URL under `/src/`, without its revision.
 *
 * @param {string} url
 * @returns {string}
 */
export function srcPathOf(url) {
  const match = REVISIONED.exec(url);

  if (!match) return new URL(url).pathname;

  return `/src/${match[2]}`;
}

/**
 * @param {string} path
 */
function normalize(path) {
  return path.replace(/^\.?\//, '').replace(/^src\//, '');
}
