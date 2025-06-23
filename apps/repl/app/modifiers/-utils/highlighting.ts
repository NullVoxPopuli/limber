import type { HighlighterGeneric } from 'shiki';

let HIGHLIGHT: HighlighterGeneric<never, never>;
let promise: Promise<HighlighterGeneric<never, never>>;

export async function getHighlighter(): Promise<HighlighterGeneric<never, never>> {
  if (promise) {
    await promise;
  }

  if (HIGHLIGHT) return HIGHLIGHT;

  const [{ createHighlighterCore }, { createOnigurumaEngine }, wasm, markdown, dark, oneDarkPro] =
    await Promise.all([
      import('shiki/core'),
      import('shiki/engine/oniguruma'),
      import('shiki/wasm'),
      import('shiki/langs/markdown.mjs'),
      import('shiki/themes/github-dark.mjs'),
      import('shiki/themes/one-dark-pro.mjs'),
    ]);

  promise = createHighlighterCore({
    themes: [
      {
        ...dark.default,
        colors: {
          ...dark.default.colors,
          'editor.background': 'var(--code-bg)',
        },
      },
      {
        ...oneDarkPro.default,
        colors: {
          ...oneDarkPro.default.colors,
          'editor.background': 'var(--code-bg)',
        },
      },
      // import('shiki/themes/github-light.mjs'),
    ],
    langs: [
      import('shiki/langs/javascript.mjs'),
      import('shiki/langs/css.mjs'),
      import('shiki/langs/html.mjs'),
      import('shiki/langs/glimmer-js.mjs'),
      // Soon?
      // import('shiki/langs/typescript.mjs'),
      // import('shiki/langs/glimmer-ts.mjs'),
      import('shiki/langs/handlebars.mjs'),
      import('shiki/langs/jsonc.mjs'),
      import('shiki/langs/svelte.mjs'),
      {
        // This *does* have embeddedLanguagesLazy
        // Just not embeddedLanguages
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...markdown.default[0]!,
        embeddedLangs: [
          'javascript',
          'css',
          'html',
          'glimmer-js',
          // 'glimmer-ts',
          // 'typescript',
          'handlebars',
          'jsonc',
          'svelte',
          'vue',
          'jsx',
          'mermaid',
        ],
      },
      import('shiki/langs/vue.mjs'),
      import('shiki/langs/jsx.mjs'),
      import('shiki/langs/mermaid.mjs'),
    ],
    langAlias: {
      gjs: 'glimmer-js',
      gts: 'glimmer-ts',
      glimdown: 'markdown',
      gmd: 'markdown',
      gdm: 'markdown',
      json: 'jsonc',
    },
    engine: createOnigurumaEngine(() => wasm),
  });

  const highlighter = await promise;

  HIGHLIGHT = highlighter;

  return highlighter;
}
