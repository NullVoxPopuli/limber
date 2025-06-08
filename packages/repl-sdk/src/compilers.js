import { esmsh } from './cdn.js';

/**
 *@type {import('./types').Options['formats']}
 */
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
      /**
       * @param {string} id
       */
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
        const [reactDom, babel] = /** @type {[any, any]} */ (
          await api.tryResolveAll(['react-dom/client', '@babel/standalone'])
        );

        const { createRoot } = reactDom;

        return {
          async compile(text) {
            // @ts-ignore
            const result = babel.transform(text, {
              filename: `repl.js`,
              // @ts-ignore
              presets: [babel.availablePresets.react],
            });

            return result.code;
          },
          async render(element, component) {
            const root = createRoot(element);

            root.render(component);

            // Wait for react-dom to render
            await new Promise((resolve) => requestAnimationFrame(resolve));
          },
        };
      },
    },
  },
  hbs: {
    /**
     * ember has historically used a subset of HBS, and then built its own features on top of.
     *
     * It is not "handlebars", but does share a lot of similarities.
     * (and these continue in ember's new gjs and gts formats)
     */
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
    /**
     * Default config, known to work with how the compiler and render functions are configured.
     */
    resolve: (id) => {
      switch (id) {
        case 'svelte':
          return `https://esm.sh/svelte?dev`;
        case 'svelte/compiler':
          return `https://esm.sh/svelte/compiler?dev`;
      }
    },
    compiler: async (config = {}, api) => {
      const versions = config.versions || {};
      const compiler = await api.tryResolve('svelte/compiler');

      return {
        compile: async (text, options) => {
          let output = await compiler.compile(text, {
            /* this errors if unexpected options are passed */
          });

          return { compiled: output.js.code, css: output.css.code };
        },
        render: async (element, component, { css }) => {
          let div = document.createElement('div');
          let style = document.createElement('style');

          style.innerHTML = css;

          element.appendChild(div);
          element.appendChild(style);
          console.log({ element, component, css });

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
    /**
     * Default config, known to work with how the compiler and render functions are configured.
     */
    resolve: (id) => {
      switch (id) {
        case 'vue':
          return `https://cdn.jsdelivr.net/npm/vue@3.5.16/+esm`;
        case '@vue/repl':
          return `https://cdn.jsdelivr.net/npm/@vue/repl@4.5.1/+esm`;
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
        compile: async (text, options) => {
          const output = { js: '', css: '', ssr: '' };

          // @ts-ignore
          await compileFile(store, {
            code: text,
            filename: options.fileName,
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
