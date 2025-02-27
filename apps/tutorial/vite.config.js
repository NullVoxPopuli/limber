import { classicEmberSupport, ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { kolay } from 'kolay/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode /* command, isSsrBuild, isPreview */ }) => ({
  resolve: {
    extensions,
  },
  optimizeDeps: {
    // a wasm-providing dependency
    exclude: ['content-tag'],
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
    tailwindcss(),
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
}));
