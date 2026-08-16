import { File } from './file.js';
import { normalize } from './path.js';

export const DEFAULT_ENTRY_NAME = 'index';

/**
 * A flavored format is `format|flavor`, and the extension is the format half.
 * `hbs|ember` lives in a `.hbs` file, `jsx|react` in a `.jsx` file.
 *
 * @param {string} format
 * @returns {string}
 */
export function extFor(format) {
  return String(format).split('|')[0] ?? '';
}

/**
 * @param {Iterable<File>} files
 * @returns {Map<string, File>}
 */
function toMap(files) {
  /** @type {Map<string, File>} */
  const map = new Map();

  for (const file of files) {
    map.set(file.path, file);
  }

  return map;
}

/**
 * @param {unknown} input
 * @returns {File[]}
 */
function coerceFiles(input) {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.map((entry) => {
      if (entry instanceof File) return entry;

      return new File(entry.path, entry.text, { format: entry.format });
    });
  }

  if (input instanceof Map) {
    return [...input.entries()].map(([path, value]) => {
      if (value instanceof File) return value.withPath(path);

      return new File(path, /** @type {string} */ (value));
    });
  }

  return Object.entries(/** @type {Record<string, string>} */ (input)).map(
    ([path, text]) => new File(path, text)
  );
}

/**
 * An immutable set of files plus a designated entry point.
 *
 * Every mutating method returns a new Project, so consumers can hold a single
 * reference and swap it, rather than subscribing to change events.
 */
export class Project {
  /** @type {Map<string, File>} */
  #files;
  /** @type {string} */
  #entry;

  /**
   * @param {Map<string, File>} files
   * @param {string} entry
   */
  constructor(files, entry) {
    this.#files = files;
    this.#entry = entry;

    Object.freeze(this);
  }

  /**
   * @param {{ files?: unknown, entry?: string | undefined }} options
   * @returns {Project}
   */
  static from({ files, entry } = {}) {
    const list = coerceFiles(files);
    const map = toMap(list);
    const first = list[0]?.path ?? '';
    const resolved = entry ? normalize(entry) : first;

    return new Project(map, resolved);
  }

  /**
   * The shape every existing limber URL describes: one unnamed document plus a format.
   *
   * @param {string} text
   * @param {{ format?: string | undefined, path?: string | undefined }} [options]
   * @returns {Project}
   */
  static single(text, { format, path } = {}) {
    const ext = extFor(format ?? '');
    const resolved = path ?? (ext ? `${DEFAULT_ENTRY_NAME}.${ext}` : DEFAULT_ENTRY_NAME);
    const file = new File(resolved, text, { format });

    return new Project(toMap([file]), file.path);
  }

  static get empty() {
    return new Project(new Map(), '');
  }

  /** @returns {File[]} */
  get files() {
    return [...this.#files.values()];
  }

  /** @returns {string[]} */
  get paths() {
    return [...this.#files.keys()];
  }

  get size() {
    return this.#files.size;
  }

  get isEmpty() {
    return this.#files.size === 0;
  }

  get isSingleFile() {
    return this.#files.size === 1;
  }

  get entryPath() {
    return this.#entry;
  }

  /** @returns {File | undefined} */
  get entry() {
    return this.#files.get(this.#entry);
  }

  /**
   * The format of the entry file. This is what the `format` query param carries.
   * @returns {string | undefined}
   */
  get format() {
    return this.entry?.format;
  }

  /**
   * @param {string} path
   * @returns {boolean}
   */
  has(path) {
    return this.#files.has(normalize(path));
  }

  /**
   * @param {string} path
   * @returns {File | undefined}
   */
  file(path) {
    return this.#files.get(normalize(path));
  }

  /**
   * @param {string} path
   * @returns {string | undefined}
   */
  read(path) {
    return this.file(path)?.text;
  }

  /**
   * Create or replace the contents of a file.
   *
   * @param {string} path
   * @param {string} text
   * @param {{ format?: string | undefined }} [options]
   * @returns {Project}
   */
  write(path, text, options = {}) {
    const key = normalize(path);
    const existing = this.#files.get(key);

    if (existing) {
      const next = options.format ? existing.withFormat(options.format) : existing;
      const updated = next.withText(text);

      if (updated === existing) return this;

      return this.#with((map) => map.set(key, updated));
    }

    const file = new File(key, text, options);
    const entry = this.isEmpty ? key : this.#entry;

    return this.#with((map) => map.set(key, file), entry);
  }

  /**
   * @param {string} path
   * @returns {Project}
   */
  remove(path) {
    const key = normalize(path);

    if (!this.#files.has(key)) return this;

    const next = this.#with((map) => map.delete(key));

    if (next.entryPath !== key) return next;

    return next.withEntry(next.paths[0] ?? '');
  }

  /**
   * @param {string} from
   * @param {string} to
   * @returns {Project}
   */
  rename(from, to) {
    const oldKey = normalize(from);
    const newKey = normalize(to);
    const file = this.#files.get(oldKey);

    if (!file || oldKey === newKey) return this;

    const entry = this.#entry === oldKey ? newKey : this.#entry;

    return this.#with((map) => {
      map.delete(oldKey);
      map.set(newKey, file.withPath(newKey));
    }, entry);
  }

  /**
   * @param {string} path
   * @returns {Project}
   */
  withEntry(path) {
    const key = normalize(path);

    if (key === this.#entry) return this;

    return new Project(new Map(this.#files), key);
  }

  /**
   * Replace the entry file's text, whatever it happens to be called.
   * The single-file editing path goes through here.
   *
   * @param {string} text
   * @param {{ format?: string | undefined }} [options]
   * @returns {Project}
   */
  withEntryText(text, options = {}) {
    if (this.isEmpty) {
      return Project.single(text, options);
    }

    return this.write(this.#entry, text, options);
  }

  /**
   * @param {string | undefined} format
   * @returns {Project}
   */
  withFormat(format) {
    const entry = this.entry;

    if (!entry) return this;

    const updated = entry.withFormat(format);

    if (updated === entry) return this;

    /**
     * The extension follows the format for single-file projects, because the
     * name was synthesized from the format in the first place.
     */
    const isSynthesized =
      entry.name === DEFAULT_ENTRY_NAME || entry.name === `${DEFAULT_ENTRY_NAME}.${entry.ext}`;
    const shouldRename = this.isSingleFile && isSynthesized && format;

    if (!shouldRename) {
      return this.#with((map) => map.set(entry.path, updated));
    }

    const ext = extFor(format);
    const renamed = updated.withPath(ext ? `${DEFAULT_ENTRY_NAME}.${ext}` : DEFAULT_ENTRY_NAME);

    return this.#with((map) => {
      map.delete(entry.path);
      map.set(renamed.path, renamed);
    }, renamed.path);
  }

  /**
   * @param {unknown} other
   * @returns {boolean}
   */
  equals(other) {
    if (!(other instanceof Project)) return false;
    if (other.entryPath !== this.#entry) return false;
    if (other.size !== this.#files.size) return false;

    for (const [path, file] of this.#files) {
      if (!file.equals(other.file(path))) return false;
    }

    return true;
  }

  /**
   * @returns {{ entry: string, files: Array<{ path: string, text: string, format?: string }> }}
   */
  toJSON() {
    return {
      entry: this.#entry,
      files: this.files.map((file) => {
        return file.hasExplicitFormat
          ? { path: file.path, text: file.text, format: file.format }
          : { path: file.path, text: file.text };
      }),
    };
  }

  /**
   * @param {{ entry?: string, files?: unknown }} json
   * @returns {Project}
   */
  static fromJSON(json) {
    return Project.from({ files: json?.files, entry: json?.entry });
  }

  /**
   * @param {(map: Map<string, File>) => void} mutate
   * @param {string} [entry]
   * @returns {Project}
   */
  #with(mutate, entry = this.#entry) {
    const map = new Map(this.#files);

    mutate(map);

    return new Project(map, entry);
  }
}
