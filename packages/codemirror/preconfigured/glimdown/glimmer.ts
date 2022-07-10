import { LRLanguage } from '@codemirror/language';
import { foldInside, foldNodeProp, indentNodeProp } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { configureNesting, parser } from '@lezer/html';

const parserWithMetadata = parser.configure({
  props: [
    styleTags({
      Identifier: t.variableName,
      Boolean: t.bool,
      String: t.string,
      LineComment: t.lineComment,
      '( )': t.paren,
    }),
    indentNodeProp.add({
      Application: (context) => context.column(context.node.from) + context.unit,
    }),
    foldNodeProp.add({
      Application: foldInside,
    }),
  ],
});

// https://github.com/codemirror/lang-javascript/blob/main/src/javascript.ts
export const glimmerLanguage = LRLanguage.define({
  parser: parserWithMetadata,
  languageData: {
    // closeBrackets: {
    //   brackets: ['{{', '{{#'],
    // },
    commentTokens: {
      block: { open: '{{!--*', close: '--}}' },
    },
    indentOnInput: /^\s*<\/\w+\W$/,
    wordChars: '-._',
  },
});
