import { basename, extname, normalize } from './path.js';

/**
 * A single file in a Project. Immutable.
 *
 * `format` is optional and only present when the caller knows something the
 * extension can't express -- a flavored format such as `hbs|ember`, or a
 * legacy URL that carried `?format=` without ever naming a file.
 */
export class File {
  /** @type {string} */
  #path;
  /** @type {string} */
  #text;
  /** @type {string | undefined} */
  #format;

  /**
   * @param {string} path
   * @param {string} text
   * @param {{ format?: string | undefined }} [options]
   */
  constructor(path, text, options = {}) {
    this.#path = normalize(path);
    this.#text = text ?? '';
    this.#format = options.format ?? undefined;

    Object.freeze(this);
  }

  get path() {
    return this.#path;
  }

  get text() {
    return this.#text;
  }

  get name() {
    return basename(this.#path);
  }

  get ext() {
    return extname(this.#path);
  }

  /**
   * The explicit format, falling back to the extension.
   * @returns {string}
   */
  get format() {
    return this.#format ?? this.ext;
  }

  get hasExplicitFormat() {
    return this.#format !== undefined;
  }

  /**
   * @param {string} text
   * @returns {File}
   */
  withText(text) {
    if (text === this.#text) return this;

    return new File(this.#path, text, { format: this.#format });
  }

  /**
   * @param {string} path
   * @returns {File}
   */
  withPath(path) {
    if (normalize(path) === this.#path) return this;

    return new File(path, this.#text, { format: this.#format });
  }

  /**
   * @param {string | undefined} format
   * @returns {File}
   */
  withFormat(format) {
    if (format === this.#format) return this;

    return new File(this.#path, this.#text, { format });
  }

  /**
   * @param {unknown} other
   * @returns {boolean}
   */
  equals(other) {
    if (!(other instanceof File)) return false;

    return other.path === this.#path && other.text === this.#text && other.format === this.format;
  }
}
