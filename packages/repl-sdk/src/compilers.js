export const compilers = {
  mermaid: {
    compiler: async (config = {}) => {
      const versions = config.versions || {};
      const source = versions['mermaid']
        ? `https://esm.sh/mermaid@${versions['mermaid']}`
        : 'https://esm.sh/mermaid';

      const { default: mermaid } = await import(/* vite-ignore */ source);

      // mermaid.initialize({ startOnLoad: false });
      let id = 0;
      return {
        compile: async (text) => {
          return `export default \`${text}\`;`;
        },
        render: async (element, text) => {
          let { svg } = await mermaid.render('graphDiv' + id++, text);

          element.innerHTML = svg;

          // mermaid.run({ nodes: [element], securityLevel: 'loose' });
        },
      };
    },
  },
  jsx: {
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
  vue: {
    compiler: async (config = {}) => {
      const versions = config.versions || {};

      const vueSource = versions['vue']
        ? `https://esm.sh/vue@${versions['vue']}`
        : 'https://esm.sh/vue';

      const vueReplSource = versions['@vue/repl']
        ? `https://esm.sh/@vue/repl@${versions['@vue/repl']}`
        : 'https://esm.sh/@vue/repl';

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

          // Wait for render
          await new Promise((resolve) => requestIdleCallback(resolve));
        },
      };
    },
  },
};
