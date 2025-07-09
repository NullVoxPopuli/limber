/**
 * @type {import('../types.ts').CompilerConfig}
 */
export const js = {
  codemirror: {
    lang: async () => {
      const { javascript } = await import('@codemirror/lang-javascript');

      return javascript();
    },
  },
  compiler: async (config, api) => {
    return {
      compile: async (text, options) => {
        // No compiling needed. Just JS
        return text;
      },
      render: async (element, fun, extra, compiler) => {
        await fun(element);
        compiler.announce('info', 'Done');
      },
    };
  },
};
