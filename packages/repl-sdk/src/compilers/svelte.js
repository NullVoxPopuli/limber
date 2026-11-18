import { esmSh } from '../cdn.js';
import { liveModules } from '../plugins/provided.js';
import { deCDN } from '../utils.js';

/**
 * Dependencies of svelte and of its compiler.
 */
const dependencies = [
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
];

/**
 * This is basically an importmap, known to work with how the compiler
 * and render functions are configured.
 *
 * Svelte 5 is no longer bundled, and has a tooooon of modules.
 * See also: https://github.com/sveltejs/svelte/discussions/15658
 *
 * The svelte runtime has import cycles that read live bindings,
 * for example `active_effect` in `error-handling.js`.
 * es-module-shims copies the exports of a module in a cycle one time,
 * so those modules see the first value forever.
 * A native import keeps the bindings live.
 */
const runtime = liveModules('repl-sdk:svelte:runtime', 'configured', (id) => {
  if (!id.startsWith('svelte')) return;

  const url = esmSh({ svelte: '5.35.7' }, id) + '?dev&target=esnext&keep-names';

  return () => import(/* @vite-ignore */ url);
});

/**
 * @type {import('../types.ts').Plugin}
 */
const cdn = {
  name: 'repl-sdk:svelte:cdn',

  resolveId(source) {
    const id = deCDN(source);

    if (dependencies.some((x) => id.startsWith(x))) return esmSh({}, id);
  },
};

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

  plugins: [runtime, cdn],
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
        const output = await compiler.compile(text, {
          /* this errors if unexpected options are passed */
          generate: 'client',
          fragments: 'html',
          // Placeholder for now until multiple files are supported
          filename: 'repl-sdk.svelte',
          dev: true,
          runes: true,
          // experimental: {
          //   async: true,
          // },
        });

        return { compiled: output.js.code, css: output.css?.code };
      },
      render: async (element, component, { css }) => {
        const div = document.createElement('div');

        if (css) {
          const style = document.createElement('style');

          style.innerHTML = /** @type {string} */ (css);
          element.appendChild(style);
        }

        element.appendChild(div);

        await new Promise((resolve) => requestAnimationFrame(resolve));

        // @ts-ignore
        const instance = svelte.mount(component, {
          target: element,
          props: {/* no props */},
        });

        api.announce('info', 'Done');

        // The return value is this render's destroy handle (see Compiler#render).
        return () => svelte.unmount(instance);
      },
    };
  },
};
