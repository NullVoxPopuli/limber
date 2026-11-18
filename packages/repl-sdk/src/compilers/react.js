import { babel } from '../cdn.js';
import { deCDN } from '../utils.js';

/**
 * NOTE: react still only publishes CJS to NPM
 */
const cdn = new Map([
  ['react', `https://esm.sh/react@19.2.3/es2022/react.development.mjs`],
  ['react/jsx-dev-runtime', `https://esm.sh/react@19.2.3/es2022/jsx-dev-runtime.development.mjs`],
  ['react/jsx-runtime', `https://esm.sh/react@19.2.3/es2022/jsx-runtime.mjs`],
  ['react-dom/client', `https://esm.sh/react-dom@19.2.3/es2022/client.development.mjs`],
]);

/**
 * @type {import('../types.ts').CompilerConfig}
 */
export const jsx = {
  plugins: [babel, { name: 'repl-sdk:react:cdn', resolveId: (id) => cdn.get(deCDN(id)) }],
  codemirror: {
    lang: async () => {
      const { javascript } = await import('@codemirror/lang-javascript');

      return javascript({ jsx: true });
    },
  },
  compiler: async (config, api) => {
    const [reactDom, babel] = await api.tryResolveAll([
      'react-dom/client',
      '@glimdown/babel-8-lite',
    ]);

    const { createRoot } = reactDom;

    return {
      async compile(text) {
        const result = babel.transform(text, {
          filename: `repl.js`,
          presets: [
            [
              babel.availablePresets.react,
              {
                /**
                 * The production automatic runtime (jsx/jsxs from
                 * 'react/jsx-runtime') works under both dev- and
                 * production-built hosts.
                 *
                 * The default (development) transform emits jsxDEV from
                 * 'react/jsx-dev-runtime', which a production build of react
                 * deliberately exports as undefined — every compiled demo
                 * then throws "_jsxDEV is not a function" at evaluation.
                 */
                runtime: 'automatic',
                development: false,
                // useBuiltIns: true,
              },
            ],
          ],
        });

        return result.code;
      },
      async render(element, component) {
        const root = createRoot(element);

        await new Promise((resolve) => requestAnimationFrame(resolve));
        root.render(component);

        // Wait for react-dom to render
        await new Promise((resolve) => requestAnimationFrame(resolve));

        // The return value is this render's destroy handle (see Compiler#render).
        // Without unmounting, every rendered demo leaves a live FiberRootNode
        // pinning its container element -- and through DOM parent/child links,
        // the entire (detached) tree the demo was rendered into. In dev,
        // react-refresh additionally roots every FiberRootNode globally
        // (helpersByRoot), so nothing about an abandoned render is ever
        // garbage-collected.
        return () => root.unmount();
      },
    };
  },
};
