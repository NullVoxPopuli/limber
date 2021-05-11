import * as js from 'monaco-languages/release/esm/javascript/javascript';

// import * as md from 'monaco-languages/release/esm/markdown/markdown';
import type * as monaco from 'monaco-editor';

type Monaco = typeof monaco;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extendLanguages(monaco: Monaco) {
  monaco.languages.register({ id: 'glimmer' });

  extendJS(monaco);
  extendHBS(monaco);
  // extendMarkdown(monaco);
}

// TODO: PR this
function extendHBS(monaco: Monaco) {
  registerAlias(monaco, 'handlebars', 'hbs');
}

function registerAlias(monaco: Monaco, source: string, ...aliases: string[]) {
  let languages = monaco.languages.getLanguages();
  let registration = languages.find((language) => language.id === source);

  if (!registration) {
    throw new Error(`${source} not found`);
  }

  for (let alias of aliases) {
    registration.aliases?.push(alias);
    registration.extensions?.push(`.${alias}`);
  }

  monaco.languages.register(registration);
}

function extendJS(monaco: Monaco) {
  const { conf, language } = js;

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
  registerAlias(monaco, 'javascript', 'gjs');
}

// export function extendMarkdown(/* monaco: Monaco */) {
//   // const { conf, language } = md;
// }
