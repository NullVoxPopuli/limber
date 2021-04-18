import { DEBUG } from '@glimmer/env';

import HBS from 'remark-hbs';
import html from 'remark-html';
import markdown from 'remark-parse';
import unified from 'unified';
import flatMap from 'unist-util-flatmap';

import { invocationOf, nameForSnippet } from './id';

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

const ALLOWED_LANGUAGES = ['gjs', 'hbs'];

// TODO: extract and publish remark plugin
function liveCodeExtraction(_options = {}) {
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
      let name = nameForSnippet(code);
      let invocation = invocationOf(name);
      let invokeNode = { type: 'html', value: invocation };

      file.data.liveCode.push({
        lang,
        name,
        code,
      });

      if (meta === 'live preview below') {
        return [node, invokeNode];
      }

      if (meta === 'live preview') {
        return [invokeNode, node];
      }

      if (meta === 'live') {
        return [invokeNode];
      }

      return [node];
    });
  };
}

const markdownCompiler = unified().use(markdown).use(liveCodeExtraction).use(HBS).use(html);

export async function parseMarkdown(input: string): Promise<LiveCodeExtraction> {
  let processed = await markdownCompiler.process(input);
  let liveCode = (processed.data as LiveData).liveCode || [];

  return { templateOnlyGlimdown: processed.toString(), blocks: liveCode };
}
