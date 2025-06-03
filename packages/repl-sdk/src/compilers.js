import { esmsh } from './cdn.js';

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
      resolve: (id) => {
        switch (id) {
          case 'react':
            return `https://esm.sh/react`;
          case 'react-dom/client':
            return `https://esm.sh/react-dom/client`;
          case '@babel/standalone':
            return `https://esm.sh/@babel/standalone`;
        }
      },
      compiler: async (config = {}, api) => {
        const [reactDom, babel] = await api.tryResolveAll([
          'react-dom/client',
          '@babel/standalone',
        ]);

        const { createRoot } = reactDom;

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
  hbs: {
    ember: {
      compiler: async (...args) => {
        const hbs = await import('./compilers/ember-hbs.js');

        return hbs.compiler(...args);
      },
    },
  },
  /**
   * https://mermaid.js.org/
   */
  mermaid: {
    needsLiveMeta: false,
    compiler: async (config = {}, api) => {
      const versions = config.versions || {};
      const { default: mermaid } = await api.tryResolve('mermaid', () => {
        return esmsh.import(versions, 'mermaid');
      });

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
    compiler: async (config = {}, api) => {
      const versions = config.versions || {};
      const { compile } = await api.tryResolve('svelte/compiler');

      return {
        compile: async (text) => {
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
    resolve: (id) => {
      switch (id) {
        case 'vue':
          return `https://esm.sh/vue`;
        // case '@vue/repl':
        // return `https://esm.sh/@vue/repl`;
      }
    },
    compiler: async (config = {}, api) => {
      const versions = config.versions || {};

      const [{ createApp }, { compileFile, useStore }] = await api.tryResolveAll([
        'vue',
        '@vue/repl',
      ]);

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
        render: async (element, component, { css }) => {
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
    compiler: async (...args) => {
      // Should be safe
      // eslint-disable-next-line import/no-cycle
      const markdown = await import('./compilers/markdown.js');

      return markdown.compiler(...args);
    },
  },
  js: {
    compiler: async (...args) => {
      return compilers.gjs.compiler(...args);
    },
  },
  gjs: {
    compiler: async (...args) => {
      const gjs = await import('./compilers/ember-gjs.js');

      return gjs.compiler(...args);
    },
  },
};
