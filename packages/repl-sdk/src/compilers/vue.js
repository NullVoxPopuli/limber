import { deCDN } from '../utils.js';

/**
 * Known to work with how the compiler and render functions are configured.
 */
const cdn = new Map([
  ['vue', `https://cdn.jsdelivr.net/npm/vue@3.5.16/+esm`],
  ['@vue/repl', `https://cdn.jsdelivr.net/npm/@vue/repl@4.5.1/+esm`],
]);

/**
 * @type {import('../types.ts').CompilerConfig}
 */
export const vue = {
  plugins: [{ name: 'repl-sdk:vue:cdn', resolveId: (id) => cdn.get(deCDN(id)) }],
  codemirror: {
    lang: async () => {
      const { vue } = await import('@codemirror/lang-vue');

      return vue();
    },
  },
  compiler: async (config, api) => {
    const [{ createApp }, { compileFile, useStore }] = await api.tryResolveAll([
      'vue',
      '@vue/repl',
    ]);

    const store = useStore();

    return {
      compile: async (text, options) => {
        const output = { js: '', css: '', ssr: '' };

        await compileFile(store, {
          code: text,
          filename: options.fileName,
          language: 'vue',
          compiled: output,
        });

        return { compiled: output.js, css: output.css };
      },
      render: async (element, component, { css }, compiler) => {
        const div = document.createElement('div');
        const style = document.createElement('style');

        style.innerHTML = /** @type {string} */ (css);

        element.appendChild(div);
        element.appendChild(style);

        const app = createApp(component);

        app.mount(div);
        compiler.announce('info', 'Done');

        // The return value is this render's destroy handle (see Compiler#render).
        return () => app.unmount();
      },
    };
  },
};
