import type { DOMPurify } from 'dompurify';
import type { HLJSApi } from 'highlight.js';

let HIGHLIGHT: HLJSApi;

export async function getHighlighter(): Promise<HLJSApi> {
  if (HIGHLIGHT) return HIGHLIGHT;

  /**
   * highlight.js is 282kb in total,
   * since we now use hljs on initial page load, eagerly, we want to load
   * as little as possible
   */
  const [hljs, glimmer, javascript, typescript, markdown, css] = await Promise.all([
    import('highlight.js/lib/core'),
    import('highlightjs-glimmer'),
    import('highlight.js/lib/languages/javascript'),
    import('highlight.js/lib/languages/typescript'),
    import('highlight.js/lib/languages/markdown'),
    import('highlight.js/lib/languages/css'),
  ]);

  HIGHLIGHT = hljs.default;
  HIGHLIGHT.registerLanguage('javascript', javascript.default);
  HIGHLIGHT.registerLanguage('typescript', typescript.default);
  HIGHLIGHT.registerLanguage('markdown', markdown.default);
  HIGHLIGHT.registerLanguage('css', css.default);

  glimmer.setup(HIGHLIGHT);

  HIGHLIGHT.registerAliases('gjs', { languageName: 'glimmer-javascript' });
  HIGHLIGHT.registerAliases('gts', { languageName: 'glimmer-javascript' });
  HIGHLIGHT.registerAliases('glimdown', { languageName: 'markdown' });
  HIGHLIGHT.registerAliases('jsx', { languageName: 'javascript' });
  HIGHLIGHT.registerAliases('svelte', { languageName: 'markdown' });

  return HIGHLIGHT;
}

let PURIFY: DOMPurify;

export async function getPurifier() {
  if (PURIFY) return PURIFY;

  PURIFY = (await import('dompurify')).default;

  return PURIFY;
}
