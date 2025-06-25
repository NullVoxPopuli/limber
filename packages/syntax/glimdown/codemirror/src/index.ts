// Much of this is taken from: https://github.com/codemirror/lang-markdown/blob/main/src/markdown.ts
// import { completeFromList } from '@codemirror/autocomplete';
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
import type {
  // BlockContext,
  // LeafBlock,
  // LeafBlockParser,
  // Line,
  // MarkdownConfig,
  MarkdownParser,
} from '@lezer/markdown';

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

// class HbsParser implements LeafBlockParser {
//   nextLine(_cx: BlockContext, _line: Line, _leaf: LeafBlock): boolean {
//     throw new Error('Method not implemented.');
//   }
//   finish(_cx: BlockContext, _leaf: LeafBlock): boolean {
//     throw new Error('Method not implemented.');
//   }
// }

// const Glimdown: MarkdownConfig = {
//   defineNodes: [{ name: 'S-Expression' }, { name: 'Block-S-Expression', block: true }],
//   parseBlock: [
//     {
//       name: 'S-Expression',
//       leaf(_, leaf): HbsParser | null {
//         return leaf.content.startsWith('{{') ? new HbsParser() : null;
//       },
//       endLeaf(_cx, _line, leaf) {
//         if (leaf.parsers.some((p) => p instanceof HbsParser)) {
//           return false;
//         }

//         return true;
//       },
//     },
//     {
//       name: 'Block-S-Expression',
//     },
//   ],
// };

const extendedMarkdown = commonmark.configure([
  GFM,
  Subscript,
  Superscript,
  Emoji,
  Table,
  // Glimdown,
]);

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
      const { svelte, svelteLanguage } = await import('@replit/codemirror-lang-svelte');

      let s = svelte();
      console.log(s, svelteLanguage);

      return s;
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
