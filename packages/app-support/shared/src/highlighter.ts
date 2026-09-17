/* eslint-disable @typescript-eslint/no-non-null-assertion */

/* eslint-disable @typescript-eslint/no-misused-promises */

import type { HighlighterGeneric } from 'shiki';

let HIGHLIGHT: HighlighterGeneric<never, never>;
let promise: Promise<HighlighterGeneric<never, never>>;

export async function getHighlighter(): Promise<
  HighlighterGeneric<never, never>
> {
  if (promise) {
    await promise;
  }

  if (HIGHLIGHT) return HIGHLIGHT;

  const {
    createHighlighterCore,
    createJavaScriptRegexEngine,
    themeDark: dark,
    themeOneDarkPro: oneDarkPro,
    markdown,
    javascript,
    typescript,
    css,
    html,
    handlebars,
    glimmerJS,
    glimmerTS,
    jsonc,
    svelte,
    vue,
    jsx,
    mermaid,
    bash,
  } = await import('./highlighter-parts.ts');

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
    ],
    langs: [
      javascript,
      typescript,
      css,
      html,
      handlebars,
      glimmerJS,
      glimmerTS,
      jsonc,
      svelte,
      vue,
      jsx,
      mermaid,
      bash,
      {
        // This *does* have embeddedLanguagesLazy
        // Just not embeddedLanguages

        ...markdown.default[0]!,
        embeddedLangs: [
          'javascript',
          'css',
          'html',
          'glimmer-js',
          'glimmer-ts',
          'typescript',
          'handlebars',
          'jsonc',
          'svelte',
          'vue',
          'jsx',
          'mermaid',
        ],
      },
    ],
    langAlias: {
      gjs: 'glimmer-js',
      gts: 'glimmer-ts',
      glimdown: 'markdown',
      gmd: 'markdown',
      gdm: 'markdown',
      json: 'jsonc',
    },
    engine: createJavaScriptRegexEngine(),
  });

  const highlighter = await promise;

  HIGHLIGHT = highlighter;

  return highlighter;
}

export async function createShiki() {
  const {
    createHighlighterCore,
    createJavaScriptRegexEngine,
    themeDark,
    themeOneDarkPro,
    javascript,
    typescript,
    bash,
    css,
    html,
    glimmerJS,
    glimmerTS,
    handlebars,
    jsonc,
    svelte,
    vue,
    jsx,
    mermaid,
  } = await import('./highlighter-parts.ts');
  const highlighter = await createHighlighterCore({
    themes: [themeDark, themeOneDarkPro],
    langs: [
      javascript,
      typescript,
      bash,
      css,
      html,
      glimmerJS,
      glimmerTS,
      handlebars,
      jsonc,
      svelte,
      vue,
      jsx,
      mermaid,
    ],
    engine: createJavaScriptRegexEngine(),
  });

  return highlighter;
}
