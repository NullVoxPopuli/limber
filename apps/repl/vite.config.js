import { classicEmberSupport, ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: true,
    minify: mode === 'production' ? 'terser' : '',
  },
  resolve: {
    extensions,
  },
  css: {
    postcss: './config/postcss.config.mjs',
  },
  optimizeDeps: {
    // a wasm-providing dependency
    exclude: ['content-tag', 'ember-repl'],
    // for top-level-await, etc
    esbuildOptions: {
      target: 'esnext',
    },
  },
  plugins: [
    icons({
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
