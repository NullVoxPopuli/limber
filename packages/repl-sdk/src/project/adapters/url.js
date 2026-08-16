import LZString from 'lz-string';

import { Project } from '../project.js';

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = LZString;

/**
 * Compressed single-document text.
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

/**
 * Compressed JSON for projects of more than one file.
 */
export const PROJECT_PARAM = 'p';

export const OWNED_PARAMS = [TEXT_PARAM, LEGACY_TEXT_PARAM, FORMAT_PARAM, PROJECT_PARAM];

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
 * Read a Project out of query params. Returns null when the params describe no
 * document at all, so callers can fall through to the next adapter.
 *
 * Note that an unknown or missing `format` is passed through untouched -- picking
 * a default is the app's policy, not this module's.
 *
 * @param {URLSearchParams | string | Record<string, string> | undefined} input
 * @returns {Project | null}
 */
export function parse(input) {
  const params = toParams(input);
  const packed = params.get(PROJECT_PARAM);

  if (packed) {
    const json = decompressFromEncodedURIComponent(packed);

    if (json) {
      try {
        return Project.fromJSON(JSON.parse(json));
      } catch {
        /**
         * A corrupt `p` is a link someone truncated. Fall through to the
         * single-file params rather than blowing up the whole boot.
         */
      }
    }
  }

  const format = params.get(FORMAT_PARAM) ?? undefined;
  const compressed = params.get(TEXT_PARAM);

  if (compressed) {
    const text = decompressFromEncodedURIComponent(compressed);

    if (text !== null) {
      return Project.single(text, { format });
    }
  }

  const legacy = params.get(LEGACY_TEXT_PARAM);

  if (legacy) {
    return Project.single(legacy, { format });
  }

  return null;
}

/**
 * Write a Project into query params, preserving any params this module doesn't own.
 *
 * @param {Project} project
 * @param {{ into?: URLSearchParams | string | Record<string, string> | undefined }} [options]
 * @returns {URLSearchParams}
 */
export function serialize(project, { into } = {}) {
  const params = new URLSearchParams(toParams(into));

  for (const param of OWNED_PARAMS) {
    params.delete(param);
  }

  if (project.isEmpty) return params;

  if (project.isSingleFile) {
    const entry = project.entry;
    const format = project.format;

    if (format) params.set(FORMAT_PARAM, format);
    params.set(TEXT_PARAM, compressToEncodedURIComponent(entry?.text ?? ''));

    return params;
  }

  params.set(PROJECT_PARAM, compressToEncodedURIComponent(JSON.stringify(project.toJSON())));

  return params;
}

/**
 * How many characters of query string this project costs.
 *
 * @param {Project} project
 * @returns {number}
 */
export function serializedLength(project) {
  return serialize(project).toString().length;
}

/**
 * @param {Project} project
 * @param {{ budget?: number }} [options]
 * @returns {boolean}
 */
export function fits(project, { budget = DEFAULT_LENGTH_BUDGET } = {}) {
  return serializedLength(project) <= budget;
}
