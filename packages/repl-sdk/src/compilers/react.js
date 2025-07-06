/**
 * @type {import('../types.ts').CompilerConfig}
 */
export const jsx = {
  codemirror: {
    lang: async () => {
      const { javascript } = await import('@codemirror/lang-javascript');

      return javascript({ jsx: true });
    },
  },
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
  compiler: async (config, api) => {
    const [reactDom, babel] = await api.tryResolveAll(['react-dom/client', '@babel/standalone']);

    const { createRoot } = reactDom;

    return {
      async compile(text) {
        const result = babel.transform(text, {
          filename: `repl.js`,
          presets: [babel.availablePresets.react],
        });

        return result.code;
      },
      async render(element, component) {
        const root = createRoot(element);

        await new Promise((resolve) => requestAnimationFrame(resolve));
        root.render(component);

        // Wait for react-dom to render
        await new Promise((resolve) => requestAnimationFrame(resolve));
      },
    };
  },
};
