/* eslint-disable no-console, no-undef */

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//
//        This is all setup, skip to the next section
//
//        This is all boilerplace for (maybe one day) upgraded and shared
//        code between these projects:
//        - https://limber.glimdown.com/
//        - https://docfy.dev
//
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

import { toHtml } from 'hast-util-to-html';
import * as inflection from 'inflection';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import flatMap from 'unist-util-flatmap';
import { inspect } from 'unist-util-inspect';
import { visit } from 'unist-util-visit';
import { v5 as uuidv5 } from 'uuid';

const example =
  `` +
  `# Title

some *bold* and _italic_ text.

<AComponent />

<With as |a|>
  <a data-not-an-anchor>
    <:block>
      block content here
    </:block>
  </a>
</With>

\`\`\`gjs live
<template>
  {{log "hello world"}}
</template>
\`\`\`
`;

///////////////////////////////////////////////////////////////////////////////

const NAMESPACE = '926f034a-f480-4112-a363-321244f4e5de';
const DEFAULT_PREFIX = 'ember-repl';

/**
 * from: https://github.com/NullVoxPopuli/ember-repl/blob/main/addon/utils.ts
 * For any given code block, a reasonably stable name can be
 * generated.
 * This can help with cacheing previously compiled components,
 * and generally allowing a consumer to derive "known references" to user-input
 */
function nameFor(code, prefix = DEFAULT_PREFIX) {
  let id = uuidv5(code, NAMESPACE);

  return `${prefix ? `${prefix}-` : ''}${id}`;
}

/**
 * Returns the text for invoking a component with a given name.
 * It is assumed the component takes no arguments, as would be the
 * case in REPLs / Playgrounds for the "root" component.
 */
function invocationOf(name) {
  // assert(
  //   `You must pass a name to invocationOf. Received: \`${name}\``,
  //   typeof name === 'string' && name.length > 0
  // );

  if (name.length === 0) {
    throw new Error(`name passed to invocationOf must have non-0 length`);
  }

  return `<${invocationName(name)} />`;
}

function invocationName(name) {
  // this library is bad. ugh, I want `@ember/string` as a v2 addon.
  return inflection.camelize(name.replaceAll(/-/g, '_'));
}

// From: https://github.com/NullVoxPopuli/limber/blob/77d67a0b6bcc9ebe6621906149de970c8a821bde/frontend/app/components/limber/output/compiler/formats/-compile/markdown-to-ember.ts#L121
// Extracts code blocks with specific tags into "data" which can be read by a "renderer"
// Demo: https://limber.glimdown.com (pick one of the non-default demos)
const ALLOWED_LANGUAGES = ['gjs', 'hbs'];

// TODO: extract and publish remark plugin
function liveCodeExtraction(options = {}) {
  let { copyComponent, snippets, demo } = options;
  let { classList: snippetClasses } = snippets || {};
  let { classList: demoClasses } = demo || {};

  snippetClasses ??= [];
  demoClasses ??= [];

  return function transformer(tree, file) {
    return flatMap(tree, (node) => {
      if (node.type !== 'code') return [node];

      let { meta, lang, value } = node;

      meta = meta?.trim();

      if (!meta || !lang) return [node];
      if (!ALLOWED_LANGUAGES.includes(lang)) return [node];

      // apparently my browser targets don't support ??= yet
      file.data.liveCode = file.data.liveCode || [];

      let code = value.trim();
      let name = nameFor(code);
      let invocation = invocationOf(name);
      let invokeNode = {
        type: 'html',
        value: `<div class="${demoClasses}">${invocation}</div>`,
      };

      let wrapper = {
        // <p> is wrong, but I think I need to make a rehype plugin instead of remark for this
        type: 'paragraph',
        data: {
          hProperties: { className: snippetClasses },
        },
        children: [node],
      };

      if (options.copyComponent) {
        wrapper.children.push({
          type: 'html',
          value: copyComponent,
        });
      }

      file.data.liveCode.push({
        lang,
        name,
        code,
      });

      if (meta === 'live preview below') {
        return [wrapper, invokeNode];
      }

      if (meta === 'live preview') {
        return [invokeNode, wrapper];
      }

      if (meta === 'live') {
        return [invokeNode];
      }

      return [wrapper];
    });
  };
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//
//        TESTS HERE
//
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

const liveCodeConfig = {
  snippets: {
    classList: ['glimdown-snippet', 'relative'],
  },
  demo: {
    classList: ['glimdown-render'],
  },
  copyComponent: '<Limber::CopyMenu />',
};
const stringifyConfig = {
  collapseEmptyAttributes: true,
  closeSelfClosing: true,
  allowParseErrors: true,
  allowDangerousCharacters: true,
  allowDangerousHtml: true,
  characterReferences: { '<': '' },
  entities: { subset: ['<'], useNamedReferences: true },
};

function customStringify(config) {
  const processorSettings = /** @type {Options} */ (this.data('settings'));
  const settings = Object.assign({}, processorSettings, config);

  Object.assign(this, { Compiler: compiler });

  /**
   * @type {import('unified').CompilerFunction<Node, string>}
   */
  function compiler(tree) {
    return toHtml(tree, {
      ...settings,
      allowDangerousHtml: true,
    });
  }
}

let inspector = () =>
  function (options = {}) {
    return function (tree) {
      let label = options?.label ? `${options.label}\n` : '';

      console.log(label, inspect(tree));
    };
  };

export async function main() {
  console.log('start');

  let withSanitize = await unified()
    .use(remarkParse)
    .use(liveCodeExtraction, liveCodeConfig)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify, stringifyConfig)
    .process(example);

  let withoutSanitize = await unified()
    .use(remarkParse)
    .use(liveCodeExtraction, liveCodeConfig)
    .use(remarkRehype)
    //.use(rehypeStringify, stringifyConfig)
    .use(customStringify, stringifyConfig)
    .process(example);

  let withRehypeRaw = await unified()
    .use(remarkParse)
    .use(inspector(), { label: 'Parsed Markdown' })
    .use(liveCodeExtraction, liveCodeConfig)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(inspector(), { label: 'Post-Rehype' })
    .use(rehypeRaw, {})
    .use(inspector(), { label: 'Post-RehypeRaw' })
    .use(rehypeStringify, stringifyConfig)
    //.use(customStringify, stringifyConfig)
    .use(inspector(), { label: 'Post-Stringify' })
    .process(example);

  let bypassGlimmer = await unified()
    .use(remarkParse)
    .use(liveCodeExtraction, liveCodeConfig)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(() => (tree) => {
      visit(tree, ['text', 'raw'], function (node) {
        // definitively not the better way, but this is supposed to detect "glimmer" nodes
        if (node.value.match(/<\/?[A-Z:].*>/g)) {
          node.type = 'glimmer_raw';
        }
      });
    })
    .use(rehypeRaw, { passThrough: ['glimmer_raw'] })
    .use(() => (tree) => {
      visit(tree, 'glimmer_raw', (node) => {
        node.type = 'raw';
      });
    })
    .use(rehypeStringify, stringifyConfig)
    .process(example);

  let outputSanitize = document.querySelector('#sanitized');
  let outputUntrusted = document.querySelector('#untrusted');
  let outputRaw = document.querySelector('#untrusted-raw');
  let outputManual = document.querySelector('#manual');
  let outputBypassGlimmer = document.querySelector('#glimmer-bypass');

  outputSanitize.innerText = String(withSanitize);
  outputUntrusted.innerText = String(withoutSanitize);
  outputRaw.innerText = String(withRehypeRaw);
  outputManual.innerText = String(withRehypeRaw).replaceAll(new RegExp('&#x3C;', 'g'), '<');
  outputBypassGlimmer.innerText = String(bypassGlimmer);

  let liveCode = withSanitize.data.liveCode || [];
  let demos = document.querySelector('#demos');

  demos.innerText = JSON.stringify(liveCode, null, 3);

  document.getElementById('loader').remove();
}
