export const compilers = {
  /**
   * JSX is too overloaded to treat one way.
   * We need to split this, and then make folks choose which one to use
   * - jsx-react
   * - jsx-vue
   * - jsx-solid
   * - (etc)
   *
   * This means that as a generic compiler, we can't just have jsx support.
   * And in markdown, we'll need to support choosing which flavor of jsx
   * via meta tags on the codefences.
   *
   * For example:
   * ```jsx solid
   * export default <></>;
   * ```
   *
   * or
   * ```jsx react
   * export default <></>;
   * ```
   *
   */
  jsx: {
    /**
     * https://react.dev/
     */
    react: {
      compiler: async (config = {}) => {
        const versions = config.versions || {};

        const reactDomSource = versions['react-dom']
          ? `https://esm.sh/react-dom@${versions['react-dom']}/client`
          : 'https://esm.sh/react-dom/client';

        const babelStandaloneSource = versions['@babel/standalone']
          ? `https://esm.sh/@babel/standalone@${versions['@babel/standalone']}`
          : 'https://esm.sh/@babel/standalone';

        const { createRoot } = await import(/* vite-ignore */ reactDomSource);
        // @ts-ignore
        const babel = await import(/* vite-ignore */ babelStandaloneSource);

        return {
          compile: async (text) => {
            const result = babel.transform(text, {
              filename: `repl.js`,
              presets: [babel.availablePresets.react],
            });
            return result.code;
          },
          render: async (element, component) => {
            const root = createRoot(element);
            root.render(component);

            // Wait for react-dom to render
            await new Promise((resolve) => requestIdleCallback(resolve));
          },
        };
      },
    },
  },
  /**
   * https://mermaid.js.org/
   */
  mermaid: {
    compiler: async (config = {}) => {
      const versions = config.versions || {};
      const source = versions['mermaid']
        ? `https://esm.sh/mermaid@${versions['mermaid']}`
        : 'https://esm.sh/mermaid';

      const { default: mermaid } = await import(/* vite-ignore */ source);

      let id = 0;
      return {
        compile: async (text) => {
          return `export default \`${text}\`;`;
        },
        render: async (element, text) => {
          let { svg } = await mermaid.render('graphDiv' + id++, text);

          element.innerHTML = svg;
        },
      };
    },
  },
  /**
   * https://svelte.dev/
   */
  svelte: {
    compiler: async (config = {}) => {
      const versions = config.versions || {};
      const svelteSource = versions['svelte']
        ? `https://esm.sh/svelte@${versions['svelte']}/compiler`
        : 'https://esm.sh/svelte/compiler';

      const { compile } = await import(/* vite-ignore */ svelteSource);

      return {
        compile: async (text, fileName) => {
          let output = await compile(text);
          return { compiled: output.js.code, css: output.css.code };
        },
        render: async (element, component, { css }) => {
          let div = document.createElement('div');
          let style = document.createElement('style');

          style.innerHTML = css;

          element.appendChild(div);
          element.appendChild(style);

          new component({
            target: div,
          });
        },
      };
    },
  },
  /**
   * https://vuejs.org/
   */
  vue: {
    compiler: async (config = {}) => {
      const versions = config.versions || {};

      const vueSource = versions['vue']
        ? `https://esm.sh/vue@${versions['vue']}`
        : 'https://esm.sh/vue';

      const vueReplSource = versions['@vue/repl']
        ? `https://esm.run/@vue/repl@${versions['@vue/repl']}`
        : 'https://esm.run/@vue/repl';

      const { createApp } = await import(/* vite-ignore */ vueSource);
      const { compileFile, useStore } = await import(/* vite-ignore */ vueReplSource);

      const store = useStore();

      return {
        compile: async (text, fileName) => {
          const output = { js: '', css: '', ssr: '' };

          // @ts-ignore
          await compileFile(store, {
            code: text,
            filename: fileName,
            language: 'vue',
            compiled: output,
          });

          return { compiled: output.js, css: output.css };
        },
        render: async (element, component, { css, compiled }) => {
          let div = document.createElement('div');
          let style = document.createElement('style');

          style.innerHTML = css;

          element.appendChild(div);
          element.appendChild(style);

          createApp(component).mount(div);
        },
      };
    },
  },
  md: {
    compiler: async (config = {}) => {
      const markdown = await import('./compilers/markdown.js');

      return markdown.compiler(config);
    },
  },
};
