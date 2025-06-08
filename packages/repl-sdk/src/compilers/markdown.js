import { assert, nextId } from '../utils.js';

const GLIMDOWN_PREVIEW = Symbol('__GLIMDOWN_PREVIEW__');
const GLIMDOWN_RENDER = Symbol('__GLIMDOWN_RENDER__');

/**
 * @param {import('../types.ts').ResolvedCompilerOptions} config
 * @param {import('../types.ts').PublicMethods} api
 */
export async function compiler(config = {}, api) {
  const versions = config.versions || {};
  const userOptions = config.userOptions || {};

  /**
   * @param {string} lang
   */
  function needsLive(lang) {
    return api.optionsFor(lang).needsLiveMeta;
  }

  /**
   * @param {string} meta
   * @param {string} lang
   */
  function isLive(meta, lang) {
    if (!needsLive(lang)) return true;
    if (!meta) return false;

    return meta.includes('live');
  }

  /**
   * @param {string} meta
   */
  function isPreview(meta) {
    if (!meta) return false;

    return meta.includes('preview');
  }

  /**
   * @param {string} meta
   */
  function isBelow(meta) {
    if (!meta) return false;

    return meta.includes('below');
  }

  const [
    // @ts-ignore
    { default: rehypeRaw },
    // @ts-ignore
    { default: rehypeStringify },
    // @ts-ignore
    { default: remarkGfm },
    // @ts-ignore
    { default: remarkParse },
    // @ts-ignore
    { default: remarkRehype },
    // @ts-ignore
    { unified },
    // @ts-ignore
    { visit },
  ] = await api.tryResolveAll([
    'rehype-raw',
    'rehype-stringify',
    'remark-gfm',
    'remark-parse',
    'remark-rehype',
    'unified',
    'unist-util-visit',
  ]);

  // Should be safe
  // eslint-disable-next-line import/no-cycle
  const { compilers } = await import('../compilers.js');

  // No recursing for now.
  const ALLOWED_FORMATS = Object.keys(compilers).filter((format) => format !== 'md');

  /**
   * Swaps live codeblocks with placeholders that the compiler can then
   * use to insert compiled-from-other-sources' code into those placeholders.
   *
   * @param {{
   *   demo: {
   *     classList: string[]
   *   },
   *   code: {
   *     classList: string[]
   *   },
   * }} options
   */
  function liveCodeExtraction(options) {
    let { code, demo } = options;
    let { classList: snippetClasses } = code || {};
    let { classList: demoClasses } = demo || {};

    snippetClasses ??= [];
    demoClasses ??= [];

    function isRelevantCode(node) {
      if (node.type !== 'code') return false;

      let { meta, lang } = node;

      if (!lang) {
        return false;
      }

      meta = meta?.trim();

      if (!isLive(meta, lang)) {
        return false;
      }

      if (!ALLOWED_FORMATS.includes(lang)) {
        return false;
      }

      return true;
    }

    function enhance(code) {
      code.data ??= {};
      code.data['hProperties'] ??= {};
      // This is secret-to-us-only API, so we don't really care about the type
      code.data['hProperties'][GLIMDOWN_PREVIEW] = true;

      return {
        data: {
          hProperties: { className: snippetClasses },
        },
        type: 'div',
        hProperties: { className: snippetClasses },
        children: [code],
      };
    }

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

        let isRelevant = isRelevantCode(node);

        if (!isRelevant) {
          let enhanced = enhance(node);

          parent.children[index] = enhanced;

          return 'skip';
        }

        if (seen.has(node)) {
          return 'skip';
        }

        seen.add(node);

        let { meta, lang, value } = node;

        if (!lang) {
          return 'skip';
        }

        /**
         * Sometimes, meta is not required,
         * like with the `mermaid` language
         */
        if (!meta) {
          if (needsLive(lang)) {
            return 'skip';
          }
        }

        file.data.liveCode ??= [];

        let code = value.trim();
        let id = nextId();

        let invokeNode = {
          type: 'html',
          data: {
            hProperties: { [GLIMDOWN_RENDER]: true },
          },
          value: `<div id="${id}" class="${demoClasses}"></div>`,
        };

        let wrapper = enhance(node);

        file.data.liveCode.push({
          format: lang,
          /* flavor,  */
          code,
          placeholderId: id,
          meta,
        });

        let live = isLive(meta, lang);
        let preview = isPreview(meta);
        let below = isBelow(meta);

        if (live && preview && below) {
          flatReplaceAt(parent.children, index, [wrapper, invokeNode]);

          return 'skip';
        }

        if (live && preview) {
          flatReplaceAt(parent.children, index, [invokeNode, wrapper]);

          return 'skip';
        }

        if (live) {
          parent.children[index] = invokeNode;

          return 'skip';
        }

        parent.children[index] = wrapper;

        return;
      });
    };
  }

  function sanitizeForGlimmer(/* options */) {
    return (tree) => {
      visit(tree, 'element', (node) => {
        if ('tagName' in node) {
          if (!['pre', 'code'].includes(node.tagName)) return;

          visit(node, 'text', (textNode) => {
            if ('value' in textNode && textNode.value) {
              textNode.value = textNode.value.replace(/{{/g, '\\{{');
            }
          });

          return 'skip';
        }
      });
    };
  }

  function buildCompiler(options) {
    let compiler = unified().use(remarkParse).use(remarkGfm);

    /**
     * If this were "use"d after `remarkRehype`,
     * remark is gone, and folks would need to work with rehype trees
     */
    if (options.remarkPlugins) {
      options.remarkPlugins.forEach((plugin) => {
        // Arrays are how plugins are passed options (for some reason?)
        // why not just invoke the the function?
        let p = Array.isArray(plugin) ? plugin : [plugin];

        compiler = compiler.use(...p);
      });
    }

    // TODO: we only want to do this when we have pre > code.
    //       code can exist inline.
    compiler = compiler.use(liveCodeExtraction, {
      snippets: {
        classList: ['glimdown-snippet', 'relative'],
      },
      demo: {
        classList: ['glimdown-render'],
      },
      copyComponent: options?.CopyComponent,
      shadowComponent: options?.ShadowComponent,
    });

    // .use(() => (tree) => visit(tree, (node) => console.log('i', node)))
    // remark rehype is needed to convert markdown to HTML
    // However, it also changes all the nodes, so we need another pass
    // to make sure our Glimmer-aware nodes are in tact
    compiler = compiler.use(remarkRehype, { allowDangerousHtml: true });

    // Convert invocables to raw format, so Glimmer can invoke them
    compiler = compiler.use(() => (tree) => {
      visit(tree, function (node) {
        // We rely on an implicit transformation of data.hProperties => properties
        let properties = node.properties;

        if (properties?.[GLIMDOWN_PREVIEW]) {
          return 'skip';
        }

        if (node.type === 'element' || ('tagName' in node && node.tagName === 'code')) {
          if (properties?.[GLIMDOWN_RENDER]) {
            node.type = 'glimmer_raw';

            return;
          }

          return 'skip';
        }

        if (node.type === 'text' || node.type === 'raw') {
          // definitively not the better way, but this is supposed to detect "glimmer" nodes
          if (
            'value' in node &&
            typeof node.value === 'string' &&
            node.value.match(/<\/?[_A-Z:0-9].*>/g)
          ) {
            node.type = 'glimmer_raw';
          }

          node.type = 'glimmer_raw';

          return 'skip';
        }

        return;
      });
    });

    if (options.rehypePlugins) {
      options.rehypePlugins.forEach((plugin) => {
        // Arrays are how plugins are passed options (for some reason?)
        // why not just invoke the the function?
        let p = Array.isArray(plugin) ? plugin : [plugin];

        compiler = compiler.use(...p);
      });
    }

    compiler = compiler
      .use(rehypeRaw, { passThrough: ['glimmer_raw', 'raw'] })
      .use(() => (tree) => {
        visit(tree, 'glimmer_raw', (node) => {
          node.type = 'raw';
        });
      });

    compiler = compiler.use(sanitizeForGlimmer);

    // Finally convert to string! oofta!
    compiler = compiler.use(rehypeStringify, {
      collapseEmptyAttributes: true,
      closeSelfClosing: true,
      allowParseErrors: true,
      allowDangerousCharacters: true,
      allowDangerousHtml: true,
    });

    return compiler;
  }

  /**
   * @param {string} input
   * @param {{ CopyComponent?: string, ShadowComponent?: string, remarkPlugins?: UnifiedPlugin[], rehypePlugins?: UnifiedPlugin[] }} options
   * @returns {Promise<{ compiled: string; liveCode: { lang: string; flavor: string; code: string; name: string }[] }>}
   */
  async function parseMarkdown(input, options = {}) {
    let markdownCompiler = buildCompiler(options);
    let processed = await markdownCompiler.process(input);
    let liveCode = processed.data.liveCode || [];
    let templateOnly = processed.toString();

    return { text: templateOnly, codeBlocks: liveCode };
  }

  return {
    compile: async (text) => {
      let result = await parseMarkdown(text, userOptions);
      let escaped = result.text.replace(/`/g, '\\`');

      return { compiled: `export default \`${escaped}\``, ...result };
    },
    render: async (element, compiled, extra, compiler) => {
      element.innerHTML = compiled;

      await Promise.all(
        extra.codeBlocks.map(async (info) => {
          let subElement = await compiler.compile(info.format, info.code, {
            flavor: info.flavor,
          });

          let selector = `#${info.placeholderId}`;
          let target = element.querySelector(selector);

          assert(
            `Could not find placeholder / target element (using selector: \`${selector}\`). ` +
              `Could not render ${info.format} block.`,
            target
          );

          target.appendChild(subElement);
        })
      );
    },
  };
}
