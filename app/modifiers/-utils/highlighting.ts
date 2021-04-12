import type { DOMPurifyI } from 'dompurify';
import type * as HighlightJS from 'highlight.js';

let HIGHLIGHT: typeof HighlightJS;

export async function getHighlighter(): Promise<typeof HighlightJS> {
  if (HIGHLIGHT) return HIGHLIGHT;

  // temp until v11 is out
  let hljsv10 = (await import('highlight.js')).default;

  HIGHLIGHT = (await import('highlightjs-glimmer/vendor/highlight.js')).hljs;
  let { setup } = await import('highlightjs-glimmer');

  hljsv10.listLanguages().forEach((name) => {
    const lang = hljsv10.getLanguage(name);

    if (!lang) return;

    HIGHLIGHT.registerLanguage(name, () => lang);
  });

  setup(HIGHLIGHT);

  return HIGHLIGHT;
}

let PURIFY: DOMPurifyI;

export async function getPurifier() {
  if (PURIFY) return PURIFY;

  PURIFY = (await import('dompurify')).default;

  return PURIFY;
}
