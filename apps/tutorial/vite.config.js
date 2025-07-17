import { ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import { kolay } from 'kolay/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode /* command, isSsrBuild, isPreview */ }) => ({
  build: {
    sourcemap: true,
    minify: 'terser',
  },
  resolve: {
    extensions,
  },
  css: {
    postcss: './config/postcss.config.mjs',
  },
  optimizeDeps: {
    // a wasm-providing dependency
    exclude: [
      'content-tag',
      // 'ember-repl'
    ],
    // for top-level-await, etc
    esbuildOptions: {
      target: 'esnext',
    },
  },
  plugins: [
    kolay({
      src: 'public/docs',
      /**
       * Pending: https://github.com/emberjs/ember.js/issues/20419
       */
      exclude: mode === 'production' ? [/^x-/, 'keyed-each-blocks'] : [],
      /**
       * This project has convention a based manifest so we only need directories
       */
      onlyDirectories: true,
      packages: [],
    }),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
}));
