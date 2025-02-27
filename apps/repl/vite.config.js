import { classicEmberSupport, ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
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
    tailwindcss(),
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
