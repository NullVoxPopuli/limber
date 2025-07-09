import { assert } from '../utils.js';

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
        assert(
          `js document must have a function for a default export. Instead received: ${typeof fun}`,
          typeof fun === 'function'
        );

        await fun(element);

        compiler.announce('info', 'Done');
      },
    };
  },
};
