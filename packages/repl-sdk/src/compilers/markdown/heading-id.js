import { kebabCase } from 'change-case';
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
  return kebabCase(value.replaceAll(/\s+/g, ' ').trim());
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
 * Slug strategies that can be named instead of passed as a function.
 *
 * `gfm` matches the anchors GitHub generates for the same markdown, via
 * `github-slugger`. A fresh slugger is created per document so its
 * duplicate-heading counter (`usage`, `usage-1`) restarts each time, the way it
 * does on GitHub -- sharing one across documents would leak counts between them.
 */
const NAMED_SLUGGERS = {
  gfm: () => {
    const slugger = new GithubSlugger();

    return (/** @type {string} */ text) => slugger.slug(text);
  },
  kebab: () => formatDefaultId,
};

/**
 * @param {import('./types').HeadingIdOptions['slug']} slug
 * @returns {(text: string) => string}
 */
function resolveSlugger(slug) {
  if (typeof slug === 'function') return slug;

  const named = slug ? NAMED_SLUGGERS[slug] : undefined;

  if (slug && !named) {
    throw new Error(
      `Unknown headingId.slug: ${JSON.stringify(slug)}. ` +
        `Expected a function or one of: ${Object.keys(NAMED_SLUGGERS).join(', ')}.`
    );
  }

  return (named ?? NAMED_SLUGGERS.kebab)();
}

/**
 * Assign an `id` to every heading, so anchors can link to sections.
 *
 * The id defaults to the heading's text in kebab-case (`'kebab'`). Pass
 * `slug: 'gfm'` to generate the anchors GitHub generates for the same markdown
 * instead -- which matters when the same `.md` is read both in a rendered site
 * and on GitHub, since an in-page `#anchor` has to resolve in both:
 *
 * ```js
 * headingId({ slug: 'gfm' });
 * //   ### `setupMirage`  ->  #setupmirage   (kebab gives #setup-mirage)
 * ```
 *
 * A function is also accepted, for anything neither mode covers:
 *
 * ```js
 * headingId({ slug: (text) => text.toUpperCase() });
 * ```
 *
 * A heading with an explicit `{#custom-id}` suffix is left alone in every mode.
 *
 * @param {import('./types').HeadingIdOptions} [options]
 */
export function headingId(options) {
  /**
   * @param {import('mdast').Root} node
   */
  return function (node) {
    // Per document, not per plugin: a named slugger carries dedupe state, and a
    // compiler can be reused across documents.
    const slug = resolveSlugger(options?.slug);

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
