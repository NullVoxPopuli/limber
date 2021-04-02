import { assert } from '@ember/debug';

import type * as monaco from 'monaco-editor';

type Monaco = typeof monaco;

async function getLanguage(monaco: Monaco, name: string) {
  let index = monaco.languages.getEncodedLanguageId(name);
  let languages = monaco.languages.getLanguages();
  let definition = languages[index - 1];

  assert(`Expected to have language definition named: ${name}`, definition);

  let loader = await definition.loader();

  return { loader, definition };
}

export async function extendHBS(monaco: Monaco) {
  let { loader, definition } = await getLanguage(monaco, 'markdown');
  let { language, conf } = loader;

  definition.aliases?.push('hbs');
}

export async function extendMD(monaco: Monaco) {
  let { loader, definition } = await getLanguage(monaco, 'markdown');
  let { language, conf } = loader;

  console.log({ language, conf });
}

export async function extendJS(monaco: Monaco) {
  let { loader, definition } = await getLanguage(monaco, 'javascript');
  let { language, conf } = loader;

  definition.aliases?.push('gjs');

  monaco.languages.register({ id: 'glimmer' });

  ///////////
  // From the Glimmer X Playground

  // JavaScript Highlighting

  // fix decorator highlighting
  language.symbols = /[=><!~?:&|+\-*/^%@]+/;

  // constants
  language.tokenizer.common.unshift([/true|false|undefined|null/, 'constant']);

  // new identifier
  language.tokenizer.common.unshift(['new', 'keyword', '@new']);
  language.tokenizer.new = [[/[a-zA-Z_$][\w$]*/, 'type.identifier', '@pop']];

  // functions
  language.tokenizer.common.unshift([/[a-zA-Z_$][\w$]*(?=\()/, 'function']);
  language.tokenizer.common.unshift(['function', 'keyword', '@function']);
  language.tokenizer.function = [[/[a-z_$][\w$]*/, 'function', '@pop']];

  // template tags
  language.tokenizer.common.unshift([/[a-zA-Z_$][\w$]*(?=`)/, 'function']);

  ///////////

  // Handlebars Embedding

  language.tokenizer.common.unshift([
    /(hbs)(`)/,
    [
      'function',
      {
        token: 'string',
        bracket: '@open',
        next: '@embeddedHandlebars',
        nextEmbedded: 'handlebars',
      },
    ],
  ]);

  language.tokenizer.embeddedHandlebars = [
    ['`', { token: 'string', bracket: '@close', next: '@pop', nextEmbedded: '@pop' }],
  ];

  ///////////

  monaco.languages.setLanguageConfiguration('glimmer', conf);
  monaco.languages.setMonarchTokensProvider('glimmer', language);
}
