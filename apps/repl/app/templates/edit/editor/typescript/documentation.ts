import { visit } from 'unist-util-visit';

import type { Root } from 'mdast';
import type { Compiler } from 'repl-sdk';

/**
 * The compiler knows more than one flavor of hbs and wants to be told which.
 * In documentation, hbs is Ember's.
 */
function hbsIsEmber() {
  return (tree: Root) => {
    visit(tree, 'code', (node) => {
      if (node.lang !== 'hbs') return;

      node.meta = node.meta ? `${node.meta} ember` : 'ember';
    });
  };
}

/**
 * The Markdown in hover, completion, and signature documentation,
 * rendered by the REPL's own `md` compiler: the same remark and rehype
 * plugins as an md document, Shiki for the code blocks included.
 *
 * The compile writes the text as a file under its own name,
 * so a compile of the document is not disturbed.
 */
export function documentationRenderer(compiler: Compiler) {
  return async (markdown: string): Promise<string> => {
    const { element, destroy } = await compiler.compile('md', markdown, {
      fileName: 'documentation.md',
      remarkPlugins: [hbsIsEmber],
    });

    try {
      return element.innerHTML;
    } finally {
      destroy();
    }
  };
}
