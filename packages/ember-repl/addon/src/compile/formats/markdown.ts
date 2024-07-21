import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { invocationOf, nameFor } from '../utils.ts';

import type { UnifiedPlugin } from '../types.ts';
import type { Node } from 'hast';
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
  shadowComponent?: string;
}

const GLIMDOWN_PREVIEW = Symbol('__GLIMDOWN_PREVIEW__');
const GLIMDOWN_RENDER = Symbol('__GLIMDOWN_RENDER__');
const ALLOWED_LANGUAGES = ['gjs', 'hbs'] as const;

type AllowedLanguage = (typeof ALLOWED_LANGUAGES)[number];
type RelevantCode = Omit<Code, 'lang'> & { lang: AllowedLanguage };

function isLive(meta: string) {
  return meta.includes('live');
}

function isPreview(meta: string) {
  return meta.includes('preview');
}

function isBelow(meta: string) {
  return meta.includes('below');
}

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
    (code.data as any)['hProperties'] ??= {};
    // This is secret-to-us-only API, so we don't really care about the type
    (code.data as any)['hProperties'][GLIMDOWN_PREVIEW] = true;

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
    visit(tree, ['code'], function (node, index, parent) {
      if (parent === null || parent === undefined) return;
      if (index === null || index === undefined) return;

      if (!isRelevantCode(node as Code)) {
        let enhanced = enhance(node as Code);

        parent.children[index] = enhanced;

        return 'skip';
      }

      if (seen.has(node)) return 'skip';

      seen.add(node);

      let { meta, lang, value } = node as Code;

      if (!meta) return 'skip';
      if (!lang) return 'skip';

      file.data.liveCode ??= [];

      let code = value.trim();
      let name = nameFor(code);
      let invocation = invocationOf(name);

      let shadow = options.shadowComponent;

      let wrapInShadow = shadow && !meta?.includes('no-shadow');

      if (wrapInShadow) {
        invocation = `<${shadow}>${invocation}</${shadow}>`;
      }

      let invokeNode = {
        type: 'html',
        data: {
          hProperties: { [GLIMDOWN_RENDER]: true },
        },
        value: `<div class="${demoClasses}">${invocation}</div>`,
      };

      let wrapper = enhance(node as Code);

      file.data.liveCode.push({
        lang,
        name,
        code,
      });

      let live = isLive(meta);
      let preview = isPreview(meta);
      let below = isBelow(meta);

      if (live && preview && below) {
        flatReplaceAt(parent.children, index, [wrapper, invokeNode]);

        return 'skip';
      }

      if (live && preview) {
        flatReplaceAt(parent.children, index, [invokeNode, wrapper]);

        return 'skip';
      }

      if (live) {
        parent.children[index] = invokeNode;

        return 'skip';
      }

      parent.children[index] = wrapper;

      return;
    });
  };
}

function sanitizeForGlimmer(/* options */) {
  return (tree: Parent) => {
    visit(tree, 'element', (node: Parent) => {
      if ('tagName' in node) {
        if (!['pre', 'code'].includes(node.tagName as string)) return;

        visit(node, 'text', (textNode: Text) => {
          if ('value' in textNode && textNode.value) {
            textNode.value = textNode.value.replace(/{{/g, '\\{{');
          }
        });

        return 'skip';
      }
    });
  };
}

function buildCompiler(options: ParseMarkdownOptions) {
  let compiler = unified().use(remarkParse).use(remarkGfm);

  /**
   * If this were "use"d after `remarkRehype`,
   * remark is gone, and folks would need to work with rehype trees
   */
  if (options.remarkPlugins) {
    options.remarkPlugins.forEach((plugin) => {
      // Arrays are how plugins are passed options (for some reason?)
      // why not just invoke the the function?
      let p = Array.isArray(plugin) ? plugin : [plugin];

      compiler = compiler.use(...(p as [any]));
    });
  }

  // TODO: we only want to do this when we have pre > code.
  //       code can exist inline.
  compiler = compiler.use(liveCodeExtraction, {
    snippets: {
      classList: ['glimdown-snippet', 'relative'],
    },
    demo: {
      classList: ['glimdown-render'],
    },
    copyComponent: options?.CopyComponent,
    shadowComponent: options?.ShadowComponent,
  });

  // .use(() => (tree) => visit(tree, (node) => console.log('i', node)))
  // remark rehype is needed to convert markdown to HTML
  // However, it also changes all the nodes, so we need another pass
  // to make sure our Glimmer-aware nodes are in tact
  compiler = compiler.use(remarkRehype, { allowDangerousHtml: true });

  // Convert invocables to raw format, so Glimmer can invoke them
  compiler = compiler.use(() => (tree: Node) => {
    visit(tree, function (node) {
      // We rely on an implicit transformation of data.hProperties => properties
      let properties = (node as any).properties;

      if (properties?.[GLIMDOWN_PREVIEW]) {
        return 'skip';
      }

      if (node.type === 'element' || ('tagName' in node && node.tagName === 'code')) {
        if (properties?.[GLIMDOWN_RENDER]) {
          node.type = 'glimmer_raw';

          return;
        }

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
  });

  if (options.rehypePlugins) {
    options.rehypePlugins.forEach((plugin) => {
      // Arrays are how plugins are passed options (for some reason?)
      // why not just invoke the the function?
      let p = Array.isArray(plugin) ? plugin : [plugin];

      compiler = compiler.use(...(p as [any]));
    });
  }

  compiler = compiler.use(rehypeRaw, { passThrough: ['glimmer_raw', 'raw'] }).use(() => (tree) => {
    visit(tree, 'glimmer_raw', (node: Node) => {
      node.type = 'raw';
    });
  });

  compiler = compiler.use(sanitizeForGlimmer);

  // Finally convert to string! oofta!
  compiler = compiler.use(rehypeStringify, {
    collapseEmptyAttributes: true,
    closeSelfClosing: true,
    allowParseErrors: true,
    allowDangerousCharacters: true,
    allowDangerousHtml: true,
  }) as any;

  return compiler as ReturnType<typeof unified>;
}

interface ParseMarkdownOptions {
  CopyComponent?: string;
  ShadowComponent?: string;
  remarkPlugins?: UnifiedPlugin[];
  rehypePlugins?: UnifiedPlugin[];
}

/**
 * @internal not under semver
 */
export async function parseMarkdown(
  input: string,
  options: ParseMarkdownOptions = {}
): Promise<LiveCodeExtraction> {
  let markdownCompiler = buildCompiler(options);
  let processed = await markdownCompiler.process(input);
  let liveCode = (processed.data as LiveData).liveCode || [];
  let templateOnly = processed.toString();

  return { templateOnlyGlimdown: templateOnly, blocks: liveCode };
}
