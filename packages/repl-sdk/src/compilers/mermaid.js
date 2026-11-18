import { esmSh } from '../cdn.js';
import { deCDN } from '../utils.js';

/**
 * @type {import('../types.ts').CompilerConfig}
 */
export const mermaid = {
  needsLiveMeta: false,
  plugins: [
    {
      name: 'repl-sdk:mermaid:cdn',

      /**
       * A host that does not provide mermaid gets the CDN build,
       * which has its dependencies inlined.
       */
      resolveId: (id, _importer, { versions }) =>
        deCDN(id) === 'mermaid' ? esmSh(versions, 'mermaid') : undefined,
    },
  ],
  codemirror: {
    lang: async () => {
      const { mermaid } = await import('codemirror-lang-mermaid');

      return mermaid();
    },
  },
  compiler: async (config, api) => {
    const { default: mermaid } = await api.tryResolve('mermaid');

    let id = 0;

    return {
      compile: async (text) => {
        return `export default \`${text}\`;`;
      },
      render: async (element, text, _, compiler) => {
        const { svg } = await mermaid.render('graphDiv' + id++, text);

        element.innerHTML = svg;
        compiler.announce('info', 'Done');
      },
    };
  },
};
