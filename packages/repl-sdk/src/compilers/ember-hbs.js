import { renderApp } from './ember/render-app-island.js';

/**
 * @param {import('../types.ts').ResolvedCompilerOptions} config
 * @param {import('../types.ts').PublicMethods} api
 */
export function compiler(config = {}, api) {
  return {
    resolve: (id) => {
      if (id === '@ember/template-compiler/runtime') {
        return `https://esm.sh/*ember-source/dist/packages/@ember/template-compiler/runtime.js`;
      }
    },
    compile: async (text) => {
      const { template } = await api.tryResolve('@ember/template-compiler/runtime');

      let component = template(text, {
        scope: () => ({ ...config.defaultScope }),
      });

      /**
       * Is this allowed here? or do I just return text,
       * and do the above in 'render'
       */
      return component;
    },
    render: async (element, compiled, extra, compiler) => {
      console.debug('[render:compiled]', compiled);

      renderApp({ element, compiler, component: compiled });
    },
  };
}
