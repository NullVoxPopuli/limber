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
    include: [
      'ember-source/@ember/owner/index.js',
      'ember-source/@ember/routing/route.js',
      '@shikijs/rehype/core',
      'ember-primitives/tabster',
      'decorator-transforms/runtime-esm',
      'ember-source/@ember/application/instance.js',
      'ember-source/@ember/array/index.js',
      'ember-source/@ember/routing/index.js',
      'ember-source/@ember/routing/router.js',
      'ember-source/@ember/template-compilation/index.js',
      'ember-source/@ember/utils/index.js',
      'ember-source/@glimmer/tracking/primitives/cache.js',
      'ember-source/@ember/template-compiler/runtime.js',
      'ember-source/dist/ember-template-compiler.js',
      'decorator-transforms',
      'babel-plugin-ember-template-compilation',
      // 'mime/lite',
      // 'es-module-shims',
      // 'comlink',
      // '@codemirror/lang-javascript',
      // 'codemirror-lang-mermaid',
      // '@replit/codemirror-lang-svelte',
      // '@codemirror/lang-vue',
      // 'resolve.exports',
      // 'resolve.imports',
    ],
    // a wasm-providing dependency
    exclude: ['content-tag', 'ember-repl'],
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
