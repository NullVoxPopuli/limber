import LZString from 'lz-string';

import { Project } from './project.js';

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = LZString;

/**
 * The document, lz-compressed.
 *
 * One file when `format` says how to read it, otherwise a `{ path: contents }`
 * object. Every URL in the wild has a format, so anything without one is new
 * enough to be a project, and a document that happens to be valid JSON is
 * never mistaken for one.
 */
export const TEXT_PARAM = 'c';

/**
 * Uncompressed single-document text. Read for old links, never written.
 */
export const LEGACY_TEXT_PARAM = 't';

/**
 * Format of the entry file, including flavor (`hbs|ember`).
 */
export const FORMAT_PARAM = 'format';

export const OWNED_PARAMS = [TEXT_PARAM, LEGACY_TEXT_PARAM, FORMAT_PARAM];

/**
 * Browsers and CDNs disagree on the real limit. This is the conservative one.
 */
export const DEFAULT_LENGTH_BUDGET = 2000;

/**
 * @param {URLSearchParams | string | Record<string, string> | undefined} input
 * @returns {URLSearchParams}
 */
function toParams(input) {
  if (input instanceof URLSearchParams) return input;
  if (typeof input === 'string') return new URLSearchParams(input);

  return new URLSearchParams(input ?? {});
}

/**
 * @param {string} text
 * @returns {Record<string, string> | undefined}
 */
function asFileMap(text) {
  if (!text.startsWith('{')) return undefined;

  /** @type {unknown} */
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    return undefined;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return undefined;

  const entries = Object.entries(parsed);

  if (entries.length === 0) return undefined;
  if (entries.some(([, contents]) => typeof contents !== 'string')) return undefined;

  return /** @type {Record<string, string>} */ (parsed);
}

/**
 * Read a Project out of query params. Returns null when the params describe no
 * document at all, so callers can fall through to the next place to look.
 *
 * An unknown or missing `format` is passed through untouched. Picking a default
 * is the app's policy, not this module's.
 *
 * @param {URLSearchParams | string | Record<string, string> | undefined} input
 * @returns {Project | null}
 */
export function readProject(input) {
  const params = toParams(input);
  const format = params.get(FORMAT_PARAM) ?? undefined;
  const compressed = params.get(TEXT_PARAM);

  if (compressed) {
    const text = decompressFromEncodedURIComponent(compressed);

    if (text !== null) {
      const files = format ? undefined : asFileMap(text);

      if (files) return Project.from({ files });

      return Project.single(text, { format });
    }
  }

  const legacy = params.get(LEGACY_TEXT_PARAM);

  if (legacy) return Project.single(legacy, { format });

  return null;
}

/**
 * Write a Project into query params, preserving any params this module doesn't own.
 *
 * @param {Project} project
 * @param {{ into?: URLSearchParams | string | Record<string, string> | undefined }} [options]
 * @returns {URLSearchParams}
 */
export function writeProject(project, { into } = {}) {
  const params = new URLSearchParams(toParams(into));

  for (const param of OWNED_PARAMS) {
    params.delete(param);
  }

  if (project.isEmpty) return params;

  if (project.isSingleFile) {
    const format = project.format;

    if (format) params.set(FORMAT_PARAM, format);
    params.set(TEXT_PARAM, compressToEncodedURIComponent(project.entry?.text ?? ''));

    return params;
  }

  /**
   * No format, because the file names carry that now, and its absence is what
   * says this is more than one file.
   */
  const files = Object.fromEntries(project.files.map((file) => [file.path, file.text]));

  params.set(TEXT_PARAM, compressToEncodedURIComponent(JSON.stringify(files)));

  return params;
}

/**
 * How many characters of query string this project costs.
 *
 * @param {Project} project
 * @returns {number}
 */
export function serializedLength(project) {
  return writeProject(project).toString().length;
}

/**
 * @param {Project} project
 * @param {{ budget?: number }} [options]
 * @returns {boolean}
 */
export function fits(project, { budget = DEFAULT_LENGTH_BUDGET } = {}) {
  return serializedLength(project) <= budget;
}
