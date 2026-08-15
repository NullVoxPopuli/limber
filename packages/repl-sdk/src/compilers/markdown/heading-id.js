import GithubSlugger from 'github-slugger';
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
 * `'Hello  there'`. Collapse that before slugging, or the gap survives into the
 * id: `hello--there` rather than `hello-there`.
 *
 * @param {string} value
 */
function normalizeText(value) {
  return value.replaceAll(/\s+/g, ' ').trim();
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
 * Ids match what GitHub generates for the same markdown, via `github-slugger`.
 * That matters because a `.md` file is typically read in two places -- a
 * rendered site, and the repo on GitHub -- and an in-page `#anchor` only
 * resolves in both if the two agree on how the id is derived:
 *
 *     ### `setupMirage`   ->  #setupmirage
 *     ### V2 JSON:API     ->  #v2-jsonapi
 *
 * A heading with an explicit `{#custom-id}` suffix is left alone.
 */
export function headingId() {
  /**
   * @param {import('mdast').Root} node
   */
  return function (node) {
    // Per document, not per plugin: the slugger carries the duplicate-heading
    // counter (`usage`, `usage-1`), and a compiler can be reused across
    // documents. Building it here restarts numbering per document, which is
    // also what GitHub does.
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

      setNodeId(node, slugger.slug(normalizeText(extractText(node.children))));
    });
  };
}
