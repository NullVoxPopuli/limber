import { visit } from 'unist-util-visit';

import { nextId } from '../../utils.js';
import { GLIMDOWN_PREVIEW, GLIMDOWN_RENDER } from './const.js';

/**
 * Swaps live codeblocks with placeholders that the compiler can then
 * use to insert compiled-from-other-sources' code into those placeholders.
 *
 * @type {import('unified').Plugin<[
 *   {
 *     demo: {
 *       classList: string[]
 *     },
 *     code: {
 *       classList: string[]
 *     },
 *     isLive: (meta: string, lang: string) => boolean,
 *     ALLOWED_FORMATS: string[],
 *     isPreview: (meta: string) => boolean,
 *     isBelow: (meta: string) => boolean,
 *     needsLive: (lang: string) => boolean
 *     getFlavorFromMeta: (meta: string, lang: string) => string | undefined
 *   },
 * ], import('mdast').Root>}
 */
export function liveCodeExtraction(options) {
  const { code, demo, isLive, ALLOWED_FORMATS, isPreview, isBelow, needsLive, getFlavorFromMeta } =
    options;
  let { classList: snippetClasses } = code || {};
  let { classList: demoClasses } = demo || {};

  snippetClasses ??= [];
  demoClasses ??= [];

  /**
   * @param {import('mdast').Code} node
   */
  function isRelevantCode(node) {
    if (node.type !== 'code') return false;

    let { meta, lang } = node;

    if (!lang) {
      return false;
    }

    meta = meta?.trim() ?? '';

    if (!isLive(meta, lang)) {
      return false;
    }

    if (!ALLOWED_FORMATS.includes(lang)) {
      return false;
    }

    return true;
  }

  /**
   * @param {import('mdast').Code} code
   * @param {string[]} [classes]
   */
  function enhance(code, classes = []) {
    code.data ??= {};
    code.data['hProperties'] ??= {};
    // This is secret-to-us-only API, so we don't really care about the type
    code.data['hProperties'][/** @type {string} */ (/** @type {unknown} */ (GLIMDOWN_PREVIEW))] =
      true;

    return {
      data: {
        hProperties: { className: classes, 'data-repl-output': true },
      },
      type: 'div',
      hProperties: { className: classes },
      children: [code],
    };
  }

  /**
   * @template T
   * @param {T[]} array
   * @param {number} index
   * @param {T[]} replacement
   */
  function flatReplaceAt(array, index, replacement) {
    array.splice(index, 1, ...replacement);
  }

  // because we mutate the tree as we iterate,
  // we need to make sure we don't loop forever
  const seen = new Set();

  return function transformer(tree, file) {
    visit(tree, ['code'], function (node, index, parent) {
      if (parent === null || parent === undefined) return;
      if (index === null || index === undefined) return;
      if (node.type !== 'code') return;

      /** @type {import('mdast').Code} */
      const codeNode = node;

      const isRelevant = isRelevantCode(codeNode);

      if (!isRelevant) {
        const enhanced = enhance(codeNode, snippetClasses);

        /** @type {unknown[]} */ (parent.children)[index] = /** @type {unknown} */ (enhanced);

        return 'skip';
      }

      if (seen.has(codeNode)) {
        return 'skip';
      }

      seen.add(codeNode);

      const { meta, lang, value } = codeNode;

      if (!lang) {
        return 'skip';
      }

      /**
       * Sometimes, meta is not required,
       * like with the `mermaid` language
       *
       * NOTE: that if a flavor is required, meta is present
       *       if the flavor is provided
       */
      if (!meta) {
        if (needsLive(lang)) {
          return 'skip';
        }
      }

      file.data.liveCode ??= [];

      const code = value.trim();
      const id = nextId();

      const invokeNode = /** @type {import('mdast').Html} */ ({
        type: 'html',
        data: {
          hProperties: {
            [/** @type {string} */ (/** @type {unknown} */ (GLIMDOWN_RENDER))]: true,
          },
        },
        value: `<div id="${id}" class="${demoClasses}"></div>`,
      });

      const wrapper = enhance(codeNode, snippetClasses);

      /** @type {unknown[]} */ (file.data.liveCode).push({
        format: lang,
        flavor: getFlavorFromMeta(meta ?? '', lang),
        code,
        placeholderId: id,
        meta,
      });

      const live = isLive(meta || '', lang);
      const preview = isPreview(meta || '');
      const below = isBelow(meta || '');

      if (live && preview && below) {
        flatReplaceAt(/** @type {unknown[]} */ (parent.children), index, [
          /** @type {unknown} */ (wrapper),
          /** @type {unknown} */ (invokeNode),
        ]);

        return 'skip';
      }

      if (live && preview) {
        flatReplaceAt(/** @type {unknown[]} */ (parent.children), index, [
          /** @type {unknown} */ (invokeNode),
          /** @type {unknown} */ (wrapper),
        ]);

        return 'skip';
      }

      if (live) {
        /** @type {unknown[]} */ (parent.children)[index] = /** @type {unknown} */ (invokeNode);

        return 'skip';
      }

      /** @type {unknown[]} */ (parent.children)[index] = /** @type {unknown} */ (wrapper);

      return;
    });
  };
}
