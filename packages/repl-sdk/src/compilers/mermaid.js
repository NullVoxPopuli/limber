import { esmsh } from '../cdn.js';

/**
 * @type {import('../types.ts').CompilerConfig}
 */
export const mermaid = {
  needsLiveMeta: false,
  compiler: async (config, api) => {
    const versions = config.versions;
    const { default: mermaid } = await api.tryResolve('mermaid', () => {
      return esmsh.import(versions, 'mermaid');
    });

    let id = 0;

    return {
      compile: async (text) => {
        return `export default \`${text}\`;`;
      },
      render: async (element, text, _, compiler) => {
        let { svg } = await mermaid.render('graphDiv' + id++, text);

        element.innerHTML = svg;
        compiler.announce('info', 'Done');
      },
    };
  },
};
