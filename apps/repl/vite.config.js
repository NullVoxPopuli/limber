import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import { emberSsg } from 'vite-ember-ssr/vite-plugin';
import circleDependency from 'vite-plugin-circular-dependency';
import mkcert from 'vite-plugin-mkcert';

import { ember } from '@nullvoxpopuli/ember-vite';

/**
 * The REPL runs user code against the Ember of this app,
 * and users need the assertions and error messages of the development build.
 * Everything else uses its production export.
 */
function emberSourceDevelopment() {
  return {
    name: 'ember-source-development',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!source.startsWith('ember-source/')) return;

      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });

      if (!resolved) return;

      return {
        ...resolved,
        id: resolved.id.replace('/ember-source/dist/prod/', '/ember-source/dist/dev/'),
      };
    },
  };
}

/**
 * Vite does not list workers in the HTML, so the browser finds the Shiki worker
 * only after the entry JavaScript runs. The preload starts that download with the page.
 * The worker later gets the file from the HTTP cache.
 *
 * Low priority, because the first render does not need Shiki,
 * and at full priority the download takes bandwidth from the entry chunks.
 */
function preloadShikiWorker() {
  return {
    name: 'preload-shiki-worker',
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle }) {
        if (!bundle) return;

        const tags = [];

        for (const fileName of Object.keys(bundle)) {
          if (!/(^|\/)shiki\.worker-[^/]+\.js$/.test(fileName)) continue;

          tags.push({
            tag: 'link',
            attrs: { rel: 'modulepreload', fetchpriority: 'low', href: `/${fileName}` },
            injectTo: 'head',
          });
        }

        return tags;
      },
    },
  };
}

export default defineConfig({
  build: {
    rolldownOptions: {
      treeshake: true,
      // index.ssg.html is the template of the prerendered pages, see emberSsg below.
      input: { ssg: 'index.ssg.html' },
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
    emberSourceDevelopment(),
    preloadShikiWorker(),
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
          // The in-process Shiki: only the prerender of the docs uses it (node has no Worker).
          {
            name: 'shiki',
            test: /highlighting\/shiki\.ts$|node_modules\/(shiki|@shikijs\/(core|engine-javascript|langs|themes|vscode-textmate)|oniguruma-[a-z-]+|regex|regex-[a-z-]+)\//,
            priority: 21,
          },
          // index.html and index.ssg.html both link app.css, so the module is shared by
          // two entries. Without a group of its own, the share-count groups merge it into a
          // chunk with the stylesheets of the whole app, and index.html then links all of
          // them as blocking, which delays the paint of the app shell.
          {
            name: 'app-css',
            test: /app\/styles\/app\.css/,
            priority: 30,
          },
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
      // A prerendered page has its content in the HTML, so it does not need the app shell.
      // The shell is 100vh tall and comes first, so with it the content starts below the fold
      // until the app boots and removes the shell.
      // The prerendered pages need no app shell, and their stylesheets must block.
      template: 'index.ssg.html',
    }),
  ],
  ssr: {
    noExternal: [/./],
  },
});
