import { visit } from 'unist-util-visit';

/**
 * @type {import('unified').Plugin<[], import('hast').Root>}
 */
export function sanitizeForGlimmer(/* options */) {
  return function transformer(tree) {
    visit(tree, 'element', function visitor(node) {
      if (node.type === 'element' && 'tagName' in node) {
        const element = /** @type {import('hast').Element} */ (node);

        if (!['pre', 'code'].includes(element.tagName)) return;

        visit(node, 'text', function textVisitor(textNode) {
          if (textNode.type === 'text') {
            const text = /** @type {import('hast').Text} */ (textNode);

            text.value = text.value.replace(/{{/g, '\\{{');
          }
        });

        return 'skip';
      }
    });
  };
}
