import { visit } from 'unist-util-visit';

import { highlightToHast } from './index.ts';

import type { Element, ElementContent, Root } from 'hast';

const languagePrefix = 'language-';

function textOf(node: ElementContent): string {
  if (node.type === 'text') return node.value;
  if (node.type !== 'element') return '';

  let result = '';

  for (const child of node.children) {
    result += textOf(child);
  }

  return result;
}

function languageOf(code: Element) {
  const classes = code.properties.className;

  if (!Array.isArray(classes)) return;

  for (const name of classes) {
    if (typeof name === 'string' && name.startsWith(languagePrefix)) {
      return name.slice(languagePrefix.length);
    }
  }
}

/**
 * The same result as `rehypeShikiFromHighlighter` from `@shikijs/rehype/core`,
 * but that plugin needs a highlighter on this thread, and ours lives in a worker.
 *
 * A code block with no language, or a language that Shiki does not have, stays as it is.
 */
export function rehypeShikiWorker() {
  return async (tree: Root) => {
    const work: Promise<void>[] = [];

    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index == null || node.tagName !== 'pre') return;

      const code = node.children[0];

      if (!code || code.type !== 'element' || code.tagName !== 'code') return;

      const lang = languageOf(code);

      if (!lang) return;

      let text = textOf(code);

      if (text.endsWith('\n')) text = text.slice(0, -1);

      // mdast-util-to-hast puts the text after the language of a code fence here
      const data = code.data as { meta?: string } | undefined;
      const meta = data?.meta ?? code.properties.metastring?.toString() ?? '';

      work.push(
        highlightToHast(text, lang, meta).then((fragment) => {
          if (!fragment) return;

          // @ts-expect-error a root in place of an element, as the upstream plugin does it
          parent.children[index] = fragment;
        })
      );
    });

    await Promise.all(work);
  };
}
