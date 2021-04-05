import type { cannotRemoveNode } from '@glimmer/syntax';
import type { DOMPurifyI } from 'dompurify';
import type * as HighlightJS from 'highlight.js';

type GlimmerNode = Parameters<typeof cannotRemoveNode>[0];
type LanguageWithCustomParser = Language & {
  customParser?: (emitter: Emitter, code: string) => void;
};

let HIGHLIGHT: typeof HighlightJS;

export async function getHighlighter() {
  if (HIGHLIGHT) return HIGHLIGHT;

  HIGHLIGHT = (await import('highlight.js')).default;

  HIGHLIGHT.unregisterLanguage('handlebars');
  HIGHLIGHT.unregisterLanguage('htmlbars');

  function glimmerParserPlugin(context: BeforeHighlightContext) {
    const language = HIGHLIGHT.getLanguage(context.language) as LanguageWithCustomParser;

    if (!language) {
      // inline blocks will never have a language
      console.warn(`Language definition not found for requested language: ${context.language}`);
    }

    if (!language) return;

    if (!language.customParser) return;

    // get a dummy result to use/abuse it's emitter
    const r = HIGHLIGHT.highlight('', { language: 'plaintext' });

    let code = context.code || context.el?.innerHTML;

    language.customParser(r.emitter, code || '');
    // provide our own result vs letting core parse the content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (context as any).result = {
      value: r.emitter.toHTML(),
      language: context.language,
      relevance: 0,
    };
  }

  HIGHLIGHT.addPlugin({
    'before:highlight': glimmerParserPlugin,
    'before:highlightElement': glimmerParserPlugin,
    'before:highlightBlock': glimmerParserPlugin,
  });

  const syntax = await import('@glimmer/syntax');

  HIGHLIGHT.registerLanguage('glimmer', () => {
    return {
      name: 'Glimmer',
      aliases: ['hbs', 'html.hbs', 'html.handlebars', 'htmlbars'],
      customParser(emitter: Emitter, code: string) {
        let { traverse, preprocess } = syntax;
        let ast = preprocess(code);

        traverse(ast, {
          ElementNode: {
            enter() {
              emitter.addText(`<i class="hljs-tag">`);
            },
            exit() {
              emitter.addText(`</i>`);
            },
          },
          PathExpression(node) {
            emitter.addText(`<i class="hljs-name">${node.original}</i>`);
          },
        });
      },
    } as LanguageWithCustomParser;
  });

  return HIGHLIGHT;
}

let PURIFY: DOMPurifyI;

export async function getPurifier() {
  if (PURIFY) return PURIFY;

  PURIFY = (await import('dompurify')).default;

  return PURIFY;
}
