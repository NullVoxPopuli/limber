import { ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import circleDependency from 'vite-plugin-circular-dependency';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(() => ({
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
      // Exclude so we keep hot-loading as we develop these packages
      'ember-repl',
      'repl-sdk',
    ],
    // These dependencies are *always*
    // needed on initial load.
    // So we can boost initial load perf by eagerly optimizing them instead of waiting for the module graph crawl
    include: [
      // Our Runtime
      // './app/lazy/shiki.ts',
      // '#app/lazy/shiki.ts',
      // 'limber/lazy/shiki.ts',
      './app/highlighting.ts',
      '#app/highlighting.ts',
      'limber/highlighting.ts',
    ],

    // for top-level-await, etc
    esbuildOptions: {
      target: 'esnext',
    },
  },
  plugins: [
    analyzer({
      enabled: true,
      fileName: 'bundle.html',
      analyzerMode: 'static',
      openAnalyzer: false,
      defaultSizes: 'brotli',
    }),
    circleDependency(),
    mkcert({
      savePath: 'node_modules/.vite-plugin-mkcert/',
    }),
    icons({
      autoInstall: true,
    }),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
}));
