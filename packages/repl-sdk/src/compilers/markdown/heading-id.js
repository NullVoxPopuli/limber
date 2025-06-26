import { kebabCase } from 'change-case';
import { visit } from 'unist-util-visit';

/**
 * @param {import('mdast').PhrasingContent[]} children
 * @return {string}
 */
function getDefaultId(children) {
  return formatDefaultId(extractText(children));
}

/**
 * @param {import('mdast').PhrasingContent[]} children
 * @return {string}
 */
function extractText(children) {
  return children
    .map(
      /**
       * @param {any} child
       */
      (child) => {
        let isEmpty = !child.value?.trim();

        if (!isEmpty) {
          return child.value;
        } else if (child.children && child.children.length > 0) {
          return extractText(child.children);
        } else {
          return '';
        }
      }
    )
    .join(' ');
}

/**
 * @param {string} value
 */
function formatDefaultId(value) {
  return kebabCase(value.replaceAll(/\\s+/g, ' ').trim());
}

/**
 * @param {import('mdast').Heading} node
 * @param {string} id
 */
function setNodeId(node, id) {
  if (!node.data) node.data = {};
  if (!node.data.hProperties) node.data.hProperties = {};

  /** @type {any} */ (node.data).id = node.data.hProperties.id = id;
}

export function headingId(options = { defaults: false }) {
  /**
   * @param {import('mdast').Root} node
   */
  return function (node) {
    visit(node, 'heading', (node) => {
      let lastChild = node.children[node.children.length - 1];

      if (lastChild && lastChild.type === 'text') {
        let string = lastChild.value.replace(/ +$/, '');
        let matched = string.match(/ {#([^]+?)}$/);

        if (matched) {
          let id = matched[1];

          if (id?.length) {
            setNodeId(node, id);

            string = string.substring(0, matched.index);
            lastChild.value = string;

            return;
          }
        }
      }

      if (options.defaults) {
        // If no custom id was found, use default instead
        setNodeId(node, getDefaultId(node.children));
      }
    });
  };
}
