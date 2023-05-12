import { invocationOf, nameFor } from 'ember-repl';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import type { Node, Parent as HParent } from 'hast';
import type { Code, Text } from 'mdast';
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

const GLIMDOWN_PREVIEW = Symbol('__GLIMDOWN_PREVIEW__');
const GLIMDOWN_RENDER = Symbol('__GLIMDOWN_RENDER__');
const ALLOWED_LANGUAGES = ['gjs', 'hbs'] as const;

type AllowedLanguage = (typeof ALLOWED_LANGUAGES)[number];
type RelevantCode = Omit<Code, 'lang'> & { lang: AllowedLanguage };

const escapeCurlies = (node: Text | Parent) => {
  if ('value' in node && node.value) {
    node.value = node.value.replace(/{{/g, '\\{{');
  }

  if ('children' in node && node.children) {
    node.children.forEach(escapeCurlies);
  }

  if (!node.data) {
    return;
  }

  if ('hChildren' in node.data && Array.isArray(node.data.hChildren)) {
    node.data.hChildren.forEach(escapeCurlies);

    return;
  }
};

// TODO: extract and publish remark plugin
function liveCodeExtraction(options: Options = {}) {
  let { copyComponent, snippets, demo } = options;
  let { classList: snippetClasses } = snippets || {};
  let { classList: demoClasses } = demo || {};

  snippetClasses ??= [];
  demoClasses ??= [];

  function isRelevantCode(node: Code): node is RelevantCode {
    if (node.type !== 'code') return false;

    let { meta, lang } = node;

    meta = meta?.trim();

    if (!meta || !lang) return false;

    if (!meta.includes('live')) {
      return false;
    }

    if (!(ALLOWED_LANGUAGES as unknown as string[]).includes(lang)) return false;

    return true;
  }

  let copyNode = {
    type: 'html',
    value: copyComponent,
  };

  function enhance(code: Code) {
    code.data ??= {};
    code.data.hProperties ??= {};
    // This is secret-to-us-only API, so we don't really care about the type
    (code.data.hProperties as any)[GLIMDOWN_PREVIEW] = true;

    return {
      data: {
        hProperties: { className: snippetClasses },
      },
      type: 'div',
      hProperties: { className: snippetClasses },
      children: [code, copyNode],
    };
  }

  function flatReplaceAt<T>(array: T[], index: number, replacement: T[]) {
    array.splice(index, 1, ...replacement);
  }

  // because we mutate the tree as we iterate,
  // we need to make sure we don't loop forever
  const seen = new Set();

  return function transformer(tree: Parent, file: VFileWithMeta) {
    visit(tree, ['code'], function (node: Code, index: number, parent: Parent) {
      if (!isRelevantCode(node)) {
        let enhanced = enhance(node);

        parent.children[index] = enhanced;

        return 'skip';
      }

      if (seen.has(node)) return 'skip';

      seen.add(node);

      let { meta, lang, value } = node;

      file.data.liveCode ??= [];

      let code = value.trim();
      let name = nameFor(code);
      let invocation = invocationOf(name);
      let invokeNode = {
        type: 'html',
        data: {
          hProperties: { [GLIMDOWN_RENDER]: true },
        },
        value: `<div class="${demoClasses}">${invocation}</div>`,
      };

      let wrapper = enhance(node);

      file.data.liveCode.push({
        lang,
        name,
        code,
      });

      if (meta === 'live preview below') {
        flatReplaceAt(parent.children, index, [wrapper, invokeNode]);

        return 'skip';
      }

      if (meta === 'live preview') {
        flatReplaceAt(parent.children, index, [invokeNode, wrapper]);

        return 'skip';
      }

      if (meta === 'live') {
        parent.children[index] = invokeNode;

        return 'skip';
      }

      parent.children[index] = wrapper;

      return;
    });
  };
}

const markdownCompiler = unified()
  // .use(markdown)
  .use(remarkParse)
  // TODO: we only want to do this when we have pre > code.
  //       code can exist inline.
  .use(liveCodeExtraction, {
    snippets: {
      classList: ['glimdown-snippet', 'relative'],
    },
    demo: {
      classList: ['glimdown-render'],
    },
    copyComponent: '<Limber::CopyMenu />',
  })
  // .use(() => (tree) => visit(tree, (node) => console.log('i', node)))
  // remark rehype is needed to convert markdown to HTML
  // However, it also changes all the nodes, so we need another pass
  // to make sure our Glimmer-aware nodes are in tact
  .use(remarkRehype, { allowDangerousHtml: true })
  // Convert invokbles to raw format, so Glimmer can invoke them
  .use(() => (tree: Node) => {
    visit(tree, function (node: HParent) {
      // We rely on an implicit transformation of data.hProperties => properties
      let properties = (node as any).properties;

      if (properties?.[GLIMDOWN_PREVIEW]) {
        // Have to sanitize anything Glimmer could try to render
        escapeCurlies(node);

        return 'skip';
      }

      if (node.type === 'element' || ('tagName' in node && node.tagName === 'code')) {
        if (properties?.[GLIMDOWN_RENDER]) {
          node.type = 'glimmer_raw';

          return;
        }

        escapeCurlies(node);

        return 'skip';
      }

      if (node.type === 'text' || node.type === 'raw') {
        // definitively not the better way, but this is supposed to detect "glimmer" nodes
        if (
          'value' in node &&
          typeof node.value === 'string' &&
          node.value.match(/<\/?[_A-Z:0-9].*>/g)
        ) {
          node.type = 'glimmer_raw';
        }

        node.type = 'glimmer_raw';

        return 'skip';
      }

      return;
    });
  })
  .use(rehypeRaw, { passThrough: ['glimmer_raw', 'raw'] })
  .use(() => (tree) => {
    visit(tree, 'glimmer_raw', (node: Node) => {
      node.type = 'raw';
    });
  })
  .use(rehypeStringify, {
    collapseEmptyAttributes: true,
    closeSelfClosing: true,
    allowParseErrors: true,
    allowDangerousCharacters: true,
    allowDangerousHtml: true,
  });

export async function parseMarkdown(input: string): Promise<LiveCodeExtraction> {
  let processed = await markdownCompiler.process(input);
  let liveCode = (processed.data as LiveData).liveCode || [];
  let templateOnly = processed.toString();

  return { templateOnlyGlimdown: templateOnly, blocks: liveCode };
}
