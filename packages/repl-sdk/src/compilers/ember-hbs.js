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
      let component = template(text, {
        scope: () => ({ ...config.defaultScope }),
      });

      /**
       * Is this allowed here? or do I just return text,
       * and do the above in 'render'
       */
      return component;
    },
    render: async (element, compiled /*, extra, compiler */) => {
      console.log('[render:compiled]', compiled);

      /**
       *
       * TODO: These will make things easier:
       *    https://github.com/emberjs/rfcs/pull/1099
       *    https://github.com/ember-cli/ember-addon-blueprint/blob/main/files/tests/test-helper.js
       */
      element.innerHTML = compiled.toString();
    },
  };
}
