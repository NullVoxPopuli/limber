import { ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import { docs } from 'kolay/vite';
import { defineConfig } from 'vite';

export default defineConfig(
  (/* { mode, command, isSsrBuild, isPreview } */) => ({
    build: {
      sourcemap: true,
      minify: 'terser',
      /**
       * Vite's default cssTarget predates light-dark(), so lightningcss
       * rewrites it into var(--lightningcss-light/dark) space toggles whose
       * :root definitions don't survive chunking, invalidating the
       * declarations (kolay ships light-dark() colors). These targets
       * support light-dark() natively, so it ships as authored.
       */
      cssTarget: ['chrome123', 'firefox120', 'safari17.5'],
    },
    resolve: {
      extensions,
    },
    css: {
      postcss: './config/postcss.config.mjs',
    },
    optimizeDeps: {
      exclude: [
        // a wasm-providing dependency
        'content-tag',
        // stateful: the scoped-route registry must be a single module
        // instance between the router (addRoutes) and the docs service
        'kolay',
      ],
      // for top-level-await, etc
      esbuildOptions: {
        target: 'esnext',
      },
    },
    plugins: [
      docs('docs', { src: import.meta.resolve('./public/docs') }),
      ember(),
      babel({
        babelHelpers: 'runtime',
        extensions,
      }),
    ],
  })
);
