import type { DOMPurifyI } from 'dompurify';
import type { HLJSApi } from 'highlight.js';

let HIGHLIGHT: HLJSApi;

export async function getHighlighter(): Promise<HLJSApi> {
  if (HIGHLIGHT) return HIGHLIGHT;

  HIGHLIGHT = (await import('highlight.js')).default;

  let { setup } = await import('highlightjs-glimmer');

  setup(HIGHLIGHT);

  return HIGHLIGHT;
}

let PURIFY: DOMPurifyI;

export async function getPurifier() {
  if (PURIFY) return PURIFY;

  PURIFY = (await import('dompurify')).default;

  return PURIFY;
}
