import { completeFromList } from '@codemirror/autocomplete';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { LanguageDescription, LanguageSupport } from '@codemirror/language';

const hbsCompletions = completeFromList([
  { label: '#each', type: 'keyword' },
  { label: '#let', type: 'keyword' },
  { label: '#if', type: 'keyword' },
]);

// javascriptLanguage.data.of({
//   autocomplete: completeFromList([
//     ...completionsOfObject(window),
//     ...completionsOfObject(document),
//   ]),
// }),

export const glimdown = [
  markdown({
    base: markdownLanguage,
    // base: {
    //   ...markdownLanguage,
    //   autocomplete: hbsCompletions,
    // },
    codeLanguages: [
      LanguageDescription.of({
        name: 'javascript',
        alias: ['js', 'gjs'],
        async load() {
          const { javascriptLanguage } = await import('@codemirror/lang-javascript');

          return new LanguageSupport(javascriptLanguage);
        },
      }),
      LanguageDescription.of({
        name: 'typescript',
        alias: ['ts', 'gts'],
        async load() {
          const { typescriptLanguage } = await import('@codemirror/lang-javascript');

          return new LanguageSupport(typescriptLanguage);
        },
      }),
      LanguageDescription.of({
        name: 'glimmer',
        alias: ['hbs'],
        async load() {
          return new LanguageSupport(markdownLanguage, [
            markdownLanguage.data.of({ autocomplete: hbsCompletions }),
          ]);
        },
      }),
    ],
  }),
];
