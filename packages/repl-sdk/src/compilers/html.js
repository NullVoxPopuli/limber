const SCHEME_ATTRIBUTE = 'data-repl-sdk-color-scheme';
const DOCTYPE = /^\s*<!doctype[^>]*>/i;
const AUTHOR_SCHEME = /<meta[^>]+name\s*=\s*["']?color-scheme/i;

/**
 * A `<meta name="color-scheme">` has the lowest precedence,
 * so a page that sets `color-scheme` itself keeps its own choice.
 *
 * The meta goes after the doctype,
 * because content before the doctype puts the page in quirks mode.
 *
 * @param {string} text
 * @param {string} scheme
 */
function withColorScheme(text, scheme) {
  if (AUTHOR_SCHEME.test(text)) return text;

  const meta = `<meta name="color-scheme" content="${scheme}" ${SCHEME_ATTRIBUTE}>`;
  const doctype = text.match(DOCTYPE)?.[0];

  if (!doctype) return meta + text;

  return doctype + meta + text.slice(doctype.length);
}

/**
 * @type {import('../types.ts').CompilerConfig}
 */
export const html = {
  codemirror: {
    lang: async () => {
      const { html } = await import('@codemirror/lang-html');

      return html();
    },
  },
  compiler: async () => {
    return {
      compile: async (text) => {
        return `export default ${JSON.stringify(text)};`;
      },
      render: async (element, text, _, compiler) => {
        /**
         * A document of its own, so that scripts (classic and module),
         * styles and `<head>` content behave as in a real page,
         * and styles do not leak in to or out of the host page.
         */
        const iframe = document.createElement('iframe');

        iframe.title = 'HTML output';
        iframe.style.display = 'block';
        iframe.style.width = '100%';
        iframe.style.border = '0';

        /**
         * In a frame, `prefers-color-scheme` follows the OS,
         * not the `color-scheme` of the host page.
         * The meta gives the frame the color scheme of the host,
         * so `light-dark()` and the default colors match the host.
         */
        const hostScheme = () => getComputedStyle(element).colorScheme;

        /** @type {ResizeObserver | undefined} */
        let observer;

        /**
         * A srcdoc frame has the origin of the host,
         * so the host can read the height of the content.
         * The frame loads again each time that it moves in the DOM.
         */
        const fitToContent = () => {
          observer?.disconnect();

          const root = iframe.contentDocument?.documentElement;

          if (!root) return;

          /**
           * `scrollHeight` never drops below the height of the frame,
           * so a frame could grow but not shrink.
           */
          observer = new ResizeObserver(() => {
            iframe.style.height = `${root.offsetHeight}px`;
          });
          observer.observe(root);
        };

        const syncScheme = () => {
          if (!element.isConnected) return;

          const meta = iframe.contentDocument?.querySelector(`meta[${SCHEME_ATTRIBUTE}]`);

          meta?.setAttribute('content', hostScheme());
        };

        /**
         * The host scheme is known only after the element
         * is in the document. A frame without a srcdoc loads
         * `about:blank` when it enters the document,
         * so the srcdoc is set on that first load.
         */
        const onLoad = () => {
          if (!iframe.srcdoc) {
            iframe.srcdoc = withColorScheme(/** @type {string} */ (text), hostScheme());

            return;
          }

          syncScheme();
          fitToContent();
        };

        /**
         * Hosts switch light and dark mode
         * with a class or a style on `<html>` or `<body>`.
         */
        const schemeObserver = new MutationObserver(syncScheme);
        const schemeOptions = { attributes: true, attributeFilter: ['class', 'style'] };

        schemeObserver.observe(document.documentElement, schemeOptions);
        schemeObserver.observe(document.body, schemeOptions);

        iframe.addEventListener('load', onLoad);
        element.appendChild(iframe);
        compiler.announce('info', 'Done');

        return () => {
          observer?.disconnect();
          schemeObserver.disconnect();
          iframe.removeEventListener('load', onLoad);
          iframe.remove();
        };
      },
    };
  },
};
