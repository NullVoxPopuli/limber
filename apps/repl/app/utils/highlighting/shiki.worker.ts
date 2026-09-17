/**
 * Shiki runs here, so that highlighting never blocks the main thread.
 *
 * The imports are static on purpose.
 * Vite bundles the worker on its own, away from the entry chunks of the page.
 */
import { createHighlighterCore, isSpecialLang } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import bash from 'shiki/langs/bash.mjs';
import css from 'shiki/langs/css.mjs';
import glimmerJS from 'shiki/langs/glimmer-js.mjs';
import glimmerTS from 'shiki/langs/glimmer-ts.mjs';
import handlebars from 'shiki/langs/handlebars.mjs';
import html from 'shiki/langs/html.mjs';
import javascript from 'shiki/langs/javascript.mjs';
import jsonc from 'shiki/langs/jsonc.mjs';
import jsx from 'shiki/langs/jsx.mjs';
import markdown from 'shiki/langs/markdown.mjs';
import mermaid from 'shiki/langs/mermaid.mjs';
import svelte from 'shiki/langs/svelte.mjs';
import typescript from 'shiki/langs/typescript.mjs';
import vue from 'shiki/langs/vue.mjs';
import githubDark from 'shiki/themes/github-dark.mjs';

import type { Root } from 'hast';

export const THEME = 'github-dark';

export interface HighlightRequest {
  id: number;
  as: 'html' | 'hast';
  code: string;
  lang: string;
  /**
   * The text after the language of a markdown code fence
   */
  meta?: string;
}

export interface HighlightResponse {
  id: number;
  /**
   * undefined when the language is not one of the loaded languages
   */
  result?: string | Root;
  error?: string;
}

const highlighter = createHighlighterCore({
  themes: [
    {
      ...githubDark,
      colors: {
        ...githubDark.colors,
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
      // The markdown grammar has embeddedLanguagesLazy, and no embeddedLangs
      ...markdown[0]!,
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

async function highlight({ as, code, lang, meta }: HighlightRequest) {
  const shiki = await highlighter;

  // getLoadedLanguages includes the aliases
  if (!shiki.getLoadedLanguages().includes(lang) && !isSpecialLang(lang)) return;

  const options = { lang, theme: THEME, meta: { __raw: meta ?? '' } };

  return as === 'html' ? shiki.codeToHtml(code, options) : shiki.codeToHast(code, options);
}

self.onmessage = async (event: MessageEvent<HighlightRequest>) => {
  const { id } = event.data;
  let response: HighlightResponse;

  try {
    response = { id, result: await highlight(event.data) };
  } catch (e) {
    response = { id, error: e instanceof Error ? e.message : String(e) };
  }

  self.postMessage(response);
};
