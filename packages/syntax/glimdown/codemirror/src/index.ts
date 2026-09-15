import { markdown } from '@codemirror/lang-markdown';
import {
  defineLanguageFacet,
  foldNodeProp,
  indentNodeProp,
  Language,
  languageDataProp,
  LanguageDescription,
} from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { Emoji, GFM, parser as baseParser, Subscript, Superscript, Table } from '@lezer/markdown';

// import { LanguageServerClient } from 'codemirror-languageserver';
import type { MarkdownParser } from '@lezer/markdown';

// javascriptLanguage.data.of({
//   autocomplete: completeFromList([
//     ...completionsOfObject(window),
//     ...completionsOfObject(document),
//   ]),
// }),

const data = defineLanguageFacet({
  block: [
    // { open: '<!--', close: '-->' },
    { open: '{{!', close: '}}' },
    { open: '{{!--', close: '--}}' },
  ],
});

const commonmark = baseParser.configure({
  props: [
    foldNodeProp.add((type) => {
      if (!type.is('Block') || type.is('Document')) return undefined;

      return (tree, state) => ({ from: state.doc.lineAt(tree.from).to, to: tree.to });
    }),
    indentNodeProp.add({
      Document: () => null,
    }),
    languageDataProp.add({
      Document: data,
    }),
  ],
});

function markdownLang(parser: MarkdownParser) {
  return new Language(data, parser);
}

const extendedMarkdown = commonmark.configure([GFM, Subscript, Superscript, Emoji, Table]);

export const codeLanguages = [
  ...languages,
  LanguageDescription.of({
    name: 'glimmer',
    alias: ['hbs', 'glimmer', 'ember', 'handlebars'],
    extensions: ['hbs'],
    async load() {
      // @ts-ignore
      const { glimmer } = await import('codemirror-lang-glimmer');

      return glimmer();
    },
  }),
  LanguageDescription.of({
    name: 'glimmer-js',
    alias: ['gjs', 'glimmer-js', 'javascript.glimmer'],
    extensions: ['gjs'],
    async load() {
      // @ts-ignore
      const { gjs } = await import('codemirror-lang-glimmer-js');

      return gjs();
    },
  }),
  LanguageDescription.of({
    name: 'glimmer-ts',
    alias: ['gts', 'glimmer-ts', 'typescript.glimmer'],
    extensions: ['gts'],
    async load() {
      // @ts-ignore
      const { gts } = await import('codemirror-lang-glimmer-js');

      return gts();
    },
  }),
  LanguageDescription.of({
    name: 'vue',
    extensions: ['vue'],
    async load() {
      // @ts-ignore
      const { vue } = await import('@codemirror/lang-vue');

      return vue();
    },
  }),
  LanguageDescription.of({
    name: 'svelte',
    extensions: ['svelte'],
    async load() {
      // @ts-ignore
      const { svelte } = await import('@replit/codemirror-lang-svelte');

      return svelte();
    },
  }),
  LanguageDescription.of({
    name: 'javascript',
    extensions: ['javascript'],
    async load() {
      // @ts-ignore
      const { javascript } = await import('@codemirror/lang-javascript');

      return javascript();
    },
  }),
  LanguageDescription.of({
    name: 'javascript-jsx',
    extensions: ['jsx', 'react'],
    async load() {
      // @ts-ignore
      const { javascript } = await import('@codemirror/lang-javascript');

      return javascript({ jsx: true });
    },
  }),

  LanguageDescription.of({
    name: 'mermaid',
    extensions: ['mermaid'],
    async load() {
      // @ts-ignore
      const { mermaid } = await import('codemirror-lang-mermaid');

      return mermaid();
    },
  }),
  LanguageDescription.of({
    name: 'yaml',
    extensions: ['yaml', 'yml'],
    async load() {
      // @ts-ignore
      const { yaml } = await import('@codemirror/lang-yaml');

      return yaml();
    },
  }),
];

export function glimdown() {
  return markdown({
    base: markdownLang(extendedMarkdown),
    codeLanguages,
  });
}
