import LZString from 'lz-string';

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = LZString;

import { formatFrom } from '#app/languages.gts';

export function fileFromParams(search: string | object = location.search) {
  const qps = new URLSearchParams(typeof search === 'string' ? search : Object.entries(search));

  return {
    text: getText(qps) ?? null,
    format: formatFrom(qps.get('format')),
    files: filesFrom(qps.get('f')),
  };
}

/**
 * The files next to the entry, as path → text,
 * from the compressed JSON of the `f` query param.
 */
export function filesFrom(encoded: string | null | undefined): Record<string, string> {
  if (!encoded) return {};

  return parseFiles(decompressFromEncodedURIComponent(encoded));
}

/**
 * The value of the `f` query param. Undefined for no files,
 * so a one-file URL looks the way it always did.
 */
export function encodeFiles(files: Record<string, string>): string | undefined {
  if (Object.keys(files).length === 0) return;

  return compressToEncodedURIComponent(JSON.stringify(files));
}

/**
 * Files as path → text, from JSON that a person can have edited.
 */
export function parseFiles(json: string | null | undefined): Record<string, string> {
  if (!json) return {};

  try {
    const parsed: unknown = JSON.parse(json);

    if (!parsed || typeof parsed !== 'object') return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string'
      )
    );
  } catch {
    console.warn(`The files are not valid JSON. Ignoring them.`);

    return {};
  }
}

function getText(qps: URLSearchParams) {
  const c = qps.get('c');

  if (c) {
    return decompressFromEncodedURIComponent(c);
  }

  const t = qps.get('t');

  if (t) {
    return t;
  }

  return;
}
