import { Compiled } from 'ember-repl';
import { CodeBlock } from 'ember-shiki';
import { type Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import type { Parent } from 'unist';

type Input = string | undefined | null;

const codeToEmberShiki: Plugin = () => {
  return (tree) => {
    visit(tree, ['code'], (node, index, parent: Parent) => {
      if (!parent) return;
      if (undefined === index) return;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      let escaped = node.value.replace(/"/g, '&quot;');

      parent.children[index] = {
        type: 'html',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        value: `<CodeBlock @code="${escaped}" @language="${node.lang}" @theme="one-dark-pro" />`,
      };
    });
  };
};

export function MarkdownToHTML(markdownText: Input | (() => Input)): ReturnType<typeof Compiled> {
  return Compiled(markdownText, {
    format: 'glimdown',
    remarkPlugins: [codeToEmberShiki],
    topLevelScope: {
      CodeBlock,
    },
  });
}
