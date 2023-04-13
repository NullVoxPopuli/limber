import { invocationOf, nameFor } from 'ember-repl';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import flatMap from 'unist-util-flatmap';
import { visit } from 'unist-util-visit';

import type { Code } from 'mdast';
import type { Parent } from 'unist';
import type { VFile } from 'vfile';

export interface ExtractedCode {
  name: string;
  code: string;
  lang: string;
}

export interface LiveCodeExtraction {
  templateOnlyGlimdown: string;
  blocks: ExtractedCode[];
}
type LiveData = {
  liveCode?: ExtractedCode[];
};
type VFileWithMeta = VFile & {
  data: LiveData;
};

interface Options {
  snippets?: {
    classList?: string[];
  };
  demo?: {
    classList?: string[];
  };
  copyComponent?: string;
}

const ALLOWED_LANGUAGES = ['gjs', 'hbs'];

// TODO: extract and publish remark plugin
function liveCodeExtraction(options: Options = {}) {
  let { copyComponent, snippets, demo } = options;
  let { classList: snippetClasses } = snippets || {};
  let { classList: demoClasses } = demo || {};

  snippetClasses ??= [];
  demoClasses ??= [];

  return function transformer(tree: Parent, file: VFileWithMeta) {
    flatMap(tree, (node: Code /* Node */) => {
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
      let copy = {
        type: 'html',
        value: copyComponent,
      };
      let wrapper = {
        // <p> is wrong, but I think I need to make a rehype plugin instead of remark for this
        type: 'div',
        data: {
          hProperties: { className: snippetClasses },
        },
        children: [node, copy],
      };

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

const markdownCompiler = unified()
  .use(remarkParse)
  .use(liveCodeExtraction, {
    snippets: {
      classList: ['glimdown-snippet', 'relative'],
    },
    demo: {
      classList: ['glimdown-render'],
    },
    copyComponent: '<__CopyMenu__ />',
  })
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(() => (tree) => {
    visit(tree, ['text', 'raw'], function (node) {
      // definitively not the better way, but this is supposed to detect "glimmer" nodes
      if (node.value.match(/<\/?[_A-Z:0-9].*>/g)) {
        node.type = 'glimmer_raw';
      }

      if (node.value.match(/\{\{.*\}\}/g)) {
        node.value = node.value.replaceAll(/\{\{/g, '\\{{');
      }
    });
  })
  .use(rehypeRaw, { passThrough: ['glimmer_raw'] })
  .use(() => (tree) => {
    visit(tree, 'glimmer_raw', (node) => {
      node.type = 'raw';
    });
  })
  .use(rehypeStringify, {
    collapseEmptyAttributes: true,
    closeSelfClosing: true,
    allowParseErrors: true,
    allowDangerousCharacters: true,
    allowDangerousHtml: true,
    // characterReferences: { '<': '' },
    // entities: { subset: ['<'], useNamedReferences: true },
  });

export async function parseMarkdown(input: string): Promise<LiveCodeExtraction> {
  let processed = await markdownCompiler.process(input);
  let liveCode = (processed.data as LiveData).liveCode || [];
  let templateOnly = processed.toString();

  return { templateOnlyGlimdown: templateOnly, blocks: liveCode };
}
