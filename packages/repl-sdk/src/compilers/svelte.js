import { esmSh } from '../cdn.js';

/**
 * @type {import('../types.ts').CompilerConfig}
 */
export const svelte = {
  codemirror: {
    lang: async () => {
      const { svelte } = await import('@replit/codemirror-lang-svelte');

      return svelte();
    },
  },

  /**
   * Default config, known to work with how the compiler and render functions are configured.
   */
  resolve: (id) => {
    // This is basically an importmap.
    // Because Svelte 5 is no longer bundled, we need another service to provide
    // these.
    //
    // Svelte 5 has a tooooon of modules, and repl-sdk (at the time of writing)
    // runs out of memory and crashes the browser while loading everything.
    //
    // There are optimizations to be had, for sure.
    // But this is good for now.
    //
    // See also: https://github.com/sveltejs/svelte/discussions/15658
    if (['svelte'].some((x) => id.startsWith(x))) {
      return esmSh({}, id, false) + '?target=esnext'; //+ '?dev&target=esnext&keep-names';
    }

    // dependencies of svelte / the compiler
    if (
      [
        'zimmerframe',
        'locate-character',
        'acorn',
        'clsx',
        'magic-string',
        '@ampproject/remapping',
        '@jridgewell/sourcemap-codec',
        'axobject-query',
        'esrap',
        'is-reference',
        'aria-query',
        '@sveltejs/acorn-typescript',
      ].some((x) => id.startsWith(x))
    ) {
      return esmSh({}, id, false);
    }
  },
  compiler: async (config, api) => {
    const [svelte, compiler] = await api.tryResolveAll(['svelte', 'svelte/compiler']);

    return {
      compile: async (text, options) => {
        /**
         * source: https://github.com/sveltejs/svelte/blob/26e328689950b390189c6da31c32283d217df4b4/packages/svelte/src/compiler/index.js#L22
         *
         * Usages:
         * https://github.com/sveltejs/svelte/blob/main/playgrounds/sandbox/run.js#L75
         */
        let output = await compiler.compile(text, {
          /* this errors if unexpected options are passed */
          generate: 'client',
          fragments: 'html',
          filename: 'repl-sdk.js',
          dev: false,
          runes: true,
        });

        return { compiled: output.js.code, css: output.css?.code };
      },
      render: async (element, component, { css }) => {
        let div = document.createElement('div');

        if (css) {
          let style = document.createElement('style');

          style.innerHTML = /** @type {string} */ (css);
          element.appendChild(style);
        }

        element.appendChild(div);

        requestAnimationFrame(() => {
          // @ts-ignore
          svelte.mount(component, {
            target: element,
            props: {
              /* no props */
            },
          });

          api.announce('info', 'Done');
        });
      },
    };
  },
};
