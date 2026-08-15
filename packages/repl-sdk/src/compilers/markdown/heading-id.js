import GithubSlugger from 'github-slugger';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

/**
 * @param {import('mdast').Heading} node
 * @param {string} id
 */
function setNodeId(node, id) {
  if (!node.data) node.data = {};
  if (!node.data.hProperties) node.data.hProperties = {};

  /** @type {any} */ (node.data).id = node.data.hProperties.id = id;
}

export function headingId() {
  /**
   * @param {import('mdast').Root} node
   */
  return function (node) {
    const slugger = new GithubSlugger();

    visit(node, 'heading', (node) => {
      const lastChild = node.children[node.children.length - 1];

      if (lastChild && lastChild.type === 'text') {
        const string = lastChild.value.replace(/ +$/, '');
        const matched = string.match(/ {#([^]+?)}$/);

        if (matched) {
          return;
        }
      }

      setNodeId(node, slugger.slug(toString(node)));
    });
  };
}
