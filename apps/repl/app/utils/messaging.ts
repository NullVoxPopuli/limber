import LZString from 'lz-string';

const { decompressFromEncodedURIComponent } = LZString;

import { formatFrom } from '#app/languages.gts';

export function fileFromParams(search: string | object = location.search) {
  const qps = new URLSearchParams(typeof search === 'string' ? search : Object.entries(search));

  return {
    text: getText(qps) ?? null,
    format: formatFrom(qps.get('format')),
  };
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
