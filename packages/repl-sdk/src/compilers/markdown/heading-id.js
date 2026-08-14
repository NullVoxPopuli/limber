import { kebabCase } from 'change-case';
import { visit } from 'unist-util-visit';

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
        const isEmpty = !child.value?.trim();

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
 * `extractText` joins a heading's children with a space, on top of whatever
 * spacing the text nodes already carry, so `## Hello *there*` extracts as
 * `'Hello  there'`. Collapse that before slugging: `kebabCase` happens not to
 * care, but a slugger that maps space to `-` would emit `hello--there`.
 *
 * @param {string} value
 */
function normalizeText(value) {
  return value.replaceAll(/\s+/g, ' ').trim();
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

/**
 * Assign an `id` to every heading, so anchors can link to sections.
 *
 * By default the id is the heading's text in kebab-case. Pass `slug` to
 * generate it some other way -- for example, matching what GitHub produces for
 * the same markdown, so an in-page `#anchor` resolves both in a rendered site
 * and in the `.md` file on GitHub:
 *
 * ```js
 * import GithubSlugger from 'github-slugger';
 *
 * const slugger = new GithubSlugger();
 *
 * headingId({ slug: (text) => slugger.slug(text) });
 * ```
 *
 * A heading with an explicit `{#custom-id}` suffix is left alone either way.
 *
 * @param {{ slug?: (text: string) => string }} [options]
 */
export function headingId(options) {
  const slug = typeof options?.slug === 'function' ? options.slug : formatDefaultId;

  /**
   * @param {import('mdast').Root} node
   */
  return function (node) {
    visit(node, 'heading', (node) => {
      const lastChild = node.children[node.children.length - 1];

      if (lastChild && lastChild.type === 'text') {
        const string = lastChild.value.replace(/ +$/, '');
        const matched = string.match(/ {#([^]+?)}$/);

        if (matched) {
          return;
        }
      }

      setNodeId(node, slug(normalizeText(extractText(node.children))));
    });
  };
}
