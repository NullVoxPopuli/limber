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
 * @param {Storage | undefined} [storage]
 * @returns {Storage | undefined}
 */
function resolveStorage(storage) {
  return storage ?? globalThis.localStorage;
}

/**
 * @param {string} format
 * @returns {string}
 */
function keyFor(format) {
  return `${PROJECT_PREFIX}${format}`;
}

/**
 * @param {Storage} storage
 * @param {string} format
 * @returns {Project | null}
 */
function readLegacy(storage, format) {
  const text = storage.getItem(`${format}-doc`);

  if (text) return Project.single(text, { format });

  const legacyFormat = storage.getItem(LEGACY_FORMAT_KEY);
  const legacyDoc = storage.getItem(LEGACY_DOCUMENT_KEY);

  if (legacyFormat && legacyDoc) {
    return Project.single(legacyDoc, { format: legacyFormat });
  }

  return null;
}

/**
 * The format the user was last editing in.
 *
 * @param {{ storage?: Storage }} [options]
 * @returns {string | null}
 */
export function storedFormat({ storage } = {}) {
  const store = resolveStorage(storage);

  if (!store) return null;

  const active = store.getItem(ACTIVE_KEY);

  if (active) return active;

  /**
   * The legacy writer stored the whole key here, not the format.
   */
  const legacy = store.getItem(LEGACY_ACTIVE_KEY);

  return legacy?.replace(/-doc$/, '') ?? null;
}

/**
 * Documents are stored per format, so switching format doesn't lose what
 * you were working on in the previous one.
 *
 * @param {{ storage?: Storage, format?: string | undefined }} [options]
 * @returns {Project | null}
 */
export function readStoredProject({ storage, format } = {}) {
  const store = resolveStorage(storage);

  if (!store) return null;

  const target = format ?? storedFormat({ storage: store });

  if (!target) return null;

  const raw = store.getItem(keyFor(target));

  if (raw) {
    try {
      return Project.fromJSON(JSON.parse(raw));
    } catch {
      /**
       * Corrupt entry. Fall through to the legacy keys.
       */
    }
  }

  return readLegacy(store, target);
}

/**
 * @param {Project} project
 * @param {{ storage?: Storage }} [options]
 * @returns {void}
 */
export function writeStoredProject(project, { storage } = {}) {
  const store = resolveStorage(storage);

  if (!store) return;
  if (project.isEmpty) return;

  const format = project.format;

  if (!format) return;

  store.setItem(ACTIVE_KEY, format);
  store.setItem(keyFor(format), JSON.stringify(project.toJSON()));
}
