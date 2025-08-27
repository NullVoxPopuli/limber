import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';
import * as css from 'shiki/langs/css.mjs';
import * as gjs from 'shiki/langs/glimmer-js.mjs';
import * as hbs from 'shiki/langs/handlebars.mjs';
import * as html from 'shiki/langs/html.mjs';
import * as js from 'shiki/langs/javascript.mjs';
import * as jsonc from 'shiki/langs/jsonc.mjs';
import * as jsx from 'shiki/langs/jsx.mjs';
import * as markdown from 'shiki/langs/markdown.mjs';
import * as mermaid from 'shiki/langs/mermaid.mjs';
import * as svelte from 'shiki/langs/svelte.mjs';
import * as vue from 'shiki/langs/vue.mjs';
import * as githubDark from 'shiki/themes/github-dark.mjs';
import * as oneDarkPro from 'shiki/themes/one-dark-pro.mjs';
import * as wasm from 'shiki/wasm';

import type { HighlighterGeneric } from 'shiki';

export const rehypePlugin = rehypeShikiFromHighlighter;

export async function loadHighlighter(): Promise<HighlighterGeneric<never, never>> {
  return await createHighlighterCore({
    themes: [
      {
        ...githubDark.default,
        colors: {
          ...githubDark.default.colors,
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
      js,
      css,
      html,
      gjs,
      // Soon?
      // import('shiki/langs/typescript.mjs'),
      // import('shiki/langs/glimmer-ts.mjs'),
      hbs,
      jsonc,
      svelte,
      {
        // This *does* have embeddedLanguagesLazy
        // Just not embeddedLanguages

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
      jsx,
      vue,
      mermaid,
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
}
