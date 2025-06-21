import { classicEmberSupport, ember, extensions } from '@embroider/vite';
import Icons from 'unplugin-icons/vite';

import { babel } from '@rollup/plugin-babel';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
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
    exclude: ['content-tag', 'ember-repl', 'ember-cached-decorator-polyfill'],
    // for top-level-await, etc
    esbuildOptions: {
      target: 'esnext',
    },
  },
  plugins: [
    Icons({
      autoInstall: true,
    }),
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
}));
