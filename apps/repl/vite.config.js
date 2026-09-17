import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import { emberSsg } from 'vite-ember-ssr/vite-plugin';
import circleDependency from 'vite-plugin-circular-dependency';
import mkcert from 'vite-plugin-mkcert';

import { ember } from '@nullvoxpopuli/ember-vite';

export default defineConfig({
  build: {
    rolldownOptions: {
      treeshake: true,
    },
  },
  css: {
    postcss: './config/postcss.config.mjs',
  },
  optimizeDeps: {
    exclude: [
      // type-only dependencies
      '@glint/template',
      // a wasm-providing dependency
      'content-tag',
      // In monorepo deps that we always want watched
      '@nullvoxpopuli/limber-shared',
      'limber-ui',
      'ember-repl',
      'repl-sdk',
      'ember-repl > repl-sdk > content-tag',
    ],
    // These dependencies are *always*
    // needed on initial load.
    // So we can boost initial load perf by eagerly optimizing them instead of waiting for the module graph crawl
    include: [
      // Our Runtime
      '@shikijs/rehype/core',
      // Framework
      // 'ember-source/@ember/**/*',
      // Theme and Syntax
      '@codemirror/language',
      '@codemirror/view',
      '@fortawesome/ember-fontawesome/components/fa-icon',
      // REPL + Editor
      // These are all await imports for production, but for dev, we're impatient
      'ember-repl > codemirror',
      'ember-repl > repl-sdk > codemirror',
      'ember-repl > repl-sdk > codemirror-lang-mermaid',
      'ember-repl > repl-sdk > tarparser',
      'ember-repl > repl-sdk > package-name-regex',
      'ember-repl > repl-sdk > rehype-raw',
      'ember-repl > repl-sdk > rehype-stringify',
      'ember-repl > repl-sdk > remark-gfm',
      'ember-repl > repl-sdk > remark-parse',
      'ember-repl > repl-sdk > remark-rehype',
      'ember-repl > repl-sdk > unified',
      'ember-repl > repl-sdk > unist-util-visit',
      'ember-repl > repl-sdk > change-case',
      'ember-repl > repl-sdk > @codemirror/autocomplete',
      'ember-repl > repl-sdk > @codemirror/commands',
      'ember-repl > repl-sdk > @codemirror/lang-html',
      'ember-repl > repl-sdk > @codemirror/lang-html > @codemirror/lang-css',
      'ember-repl > repl-sdk > @codemirror/lang-javascript',
      'ember-repl > repl-sdk > @codemirror/lang-javascript > @lezer/javascript',
      'ember-repl > repl-sdk > @codemirror/lang-markdown',
      'ember-repl > repl-sdk > @codemirror/lang-markdown > @lezer/markdown',
      'ember-repl > repl-sdk > @codemirror/lang-vue',
      'ember-repl > repl-sdk > @codemirror/lang-yaml',
      'ember-repl > repl-sdk > @codemirror/language',
      'ember-repl > repl-sdk > @codemirror/language > @lezer/common',
      'ember-repl > repl-sdk > @codemirror/language > @lezer/lr',
      'ember-repl > repl-sdk > @codemirror/language > @lezer/highlight',
      'ember-repl > repl-sdk > @codemirror/language-data',
      'ember-repl > repl-sdk > @codemirror/lint',
      'ember-repl > repl-sdk > @codemirror/search',
      'ember-repl > repl-sdk > @codemirror/state',
      'ember-repl > repl-sdk > @codemirror/view',
    ],
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
    ember({
      babel: {
        configFile: './babel.config.mjs',
      },
      production: {
        // Without groups, rolldown emits one chunk per shared module,
        // and the entry page preloads more than 100 files.
        codeSplittingGroups: [
          // Only dynamic imports reach the editor and markdown libraries.
          // Without their own groups, they share chunks with modules
          // that the entry page needs, and the entry page downloads them.
          // minShareCount keeps each lazy language mode in its own chunk.
          {
            name: 'editor',
            test: /packages\/syntax\/|node_modules\/(@codemirror|@lezer|codemirror|crelt|style-mod|w3c-keyname)/,
            minShareCount: 2,
            priority: 20,
          },
          {
            name: 'markdown',
            test: /node_modules\/(parse5|entities|unified|vfile|property-information|(micromark|mdast|hast|unist|remark|rehype)[^/]*)\//,
            minShareCount: 2,
            priority: 20,
          },
          {
            name: 'common',
            minShareCount: 10,
            minSize: 10000,
            maxSize: 1024 * 1024,
            priority: 9,
          },
          {
            name: 'uncommon',
            minShareCount: 2,
            minSize: 10000,
            maxSize: 1024 * 1024,
            priority: 5,
          },
        ],
      },
    }),
    emberSsg({
      routes: [
        'docs',
        'docs/editor',
        'docs/embedding',
        'docs/ember-repl',
        'docs/repl-sdk',
        'docs/related',
      ],
      ssrEntry: 'app/app-ssr.ts',
      rehydrate: true,
    }),
  ],
  ssr: {
    noExternal: [/./],
  },
});
