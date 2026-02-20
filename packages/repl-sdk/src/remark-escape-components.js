import { visit } from 'unist-util-visit';

/**
 * A unique placeholder that replaces `<` in PascalCase component tags
 * inside inline code and non-live code fences. It survives the unified
 * pipeline without being entity-encoded, and is converted to `&#x3C;`
 * in the final post-processing step inside `parseMarkdown()`.
 */
export const REPL_LT = '__REPL_LT__';

/**
 * Remark plugin: escape PascalCase component tags in `inlineCode` and
 * non-live `code` (code fence) nodes by replacing `<` with a placeholder.
 */
function remarkEscapeComponents() {
  /** @param {import('mdast').Root} tree */
  return (tree) => {
    visit(tree, (node) => {
      // Inline code (backticks)
      if (node.type === 'inlineCode') {
        node.value = node.value
          .replace(/<([A-Z][a-zA-Z0-9]*(?:\s[^<]*)?)>/g, REPL_LT + '$1>')
          .replace(/<\/([A-Z][a-zA-Z0-9]*)>/g, REPL_LT + '/$1>');
      }

      // Code fences (``` blocks)
      if (node.type === 'code') {
        // Only escape if not live
        if (!/\blive\b/.test(node.meta || '')) {
          node.value = node.value
            .replace(/<([A-Z][a-zA-Z0-9]*(?:\s[^<]*)?)>/g, REPL_LT + '$1>')
            .replace(/<\/([A-Z][a-zA-Z0-9]*)>/g, REPL_LT + '/$1>');
        }
      }
    });
  };
}

export default remarkEscapeComponents;
