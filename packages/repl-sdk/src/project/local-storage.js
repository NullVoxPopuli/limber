import { Project } from './project.js';

export const ACTIVE_KEY = 'repl:active';
export const PROJECT_PREFIX = 'repl:project:';

/**
 * Pre-VFS keys, read so returning users keep their document. Never written.
 *
 * `<format>-doc` was written but never successfully read back: the writer put
 * `gjs-doc` into `active-format` and the reader appended `-doc` to it again,
 * so it always looked for `gjs-doc-doc`. Reading the correct key here means
 * restore starts working for anyone who has one of these.
 */
export const LEGACY_ACTIVE_KEY = 'active-format';
export const LEGACY_FORMAT_KEY = 'format';
export const LEGACY_DOCUMENT_KEY = 'document';

/**
 * @param {string} format
 * @returns {string}
 */
function keyFor(format) {
  return `${PROJECT_PREFIX}${format}`;
}

/**
 * @param {string} format
 * @returns {Project | null}
 */
function readLegacy(format) {
  const text = localStorage.getItem(`${format}-doc`);

  if (text) return Project.single(text, { format });

  const legacyFormat = localStorage.getItem(LEGACY_FORMAT_KEY);
  const legacyDoc = localStorage.getItem(LEGACY_DOCUMENT_KEY);

  if (legacyFormat && legacyDoc) {
    return Project.single(legacyDoc, { format: legacyFormat });
  }

  return null;
}

/**
 * The format the user was last editing in.
 *
 * @returns {string | null}
 */
export function storedFormat() {
  const active = localStorage.getItem(ACTIVE_KEY);

  if (active) return active;

  /**
   * The legacy writer stored the whole key here, not the format.
   */
  const legacy = localStorage.getItem(LEGACY_ACTIVE_KEY);

  return legacy?.replace(/-doc$/, '') ?? null;
}

/**
 * Documents are stored per format, so switching format doesn't lose what
 * you were working on in the previous one.
 *
 * @param {{ format?: string | undefined }} [options]
 * @returns {Project | null}
 */
export function readStoredProject({ format } = {}) {
  const target = format ?? storedFormat();

  if (!target) return null;

  const raw = localStorage.getItem(keyFor(target));

  if (raw) {
    try {
      return Project.fromJSON(JSON.parse(raw));
    } catch {
      /**
       * Corrupt entry. Fall through to the legacy keys.
       */
    }
  }

  return readLegacy(target);
}

/**
 * @param {Project} project
 * @returns {void}
 */
export function writeStoredProject(project) {
  if (project.isEmpty) return;

  const format = project.format;

  if (!format) return;

  localStorage.setItem(ACTIVE_KEY, format);
  localStorage.setItem(keyFor(format), JSON.stringify(project.toJSON()));
}
