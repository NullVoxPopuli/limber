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
        iframe.srcdoc = /** @type {string} */ (text);

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

        iframe.addEventListener('load', fitToContent);
        element.appendChild(iframe);
        compiler.announce('info', 'Done');

        return () => {
          observer?.disconnect();
          iframe.removeEventListener('load', fitToContent);
          iframe.remove();
        };
      },
    };
  },
};
