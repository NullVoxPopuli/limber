import { ember, extensions, resolver, templateTag } from '@embroider/vite';
import { createRequire } from 'node:module';

import { babel } from '@rollup/plugin-babel';
import { parse as oxcParse } from 'oxc-parser';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import { emberSsg } from 'vite-ember-ssr/vite-plugin';
import circleDependency from 'vite-plugin-circular-dependency';
import mkcert from 'vite-plugin-mkcert';
import { walk } from 'zimmerframe';

const require = createRequire(import.meta.url);
// TODO: export this separately
const emberConfig = ember()[3];

/**
 * These imports are compiled away by 2 of the babel plugins
 */
const babelRequiredImports = [
  // Templates
  '@ember/template-compiler',
  '@ember/template-compilation',

  // Macros
  '@embroider/macros',
  '@glimmer/env',
  '@ember/application/deprecations',
  // macros only needed in prod
  '@ember/debug',
];

import { transform } from 'oxc-transform';

function maybeBabel(options = {}) {
  const env = options?.env ?? {};
  const babelMacros = new Set(babelRequiredImports);
  const original = babel({
    babelHelpers: 'runtime',
    skipPreflightCheck: true,
    extensions,
    configFile: require.resolve('./babel.config.mjs'),
  });

  if (env.mode === 'development') {
    babelMacros.delete('@ember/assert');
  }

  // env.i ||= 0;
  // env.t ||= 0;

  return {
    ...original,
    name: 'limber:babel',
    enforce: 'pre',
    // buildEnd() {
    //   console.debug({ i: env.i, t: env.t });
    // },
    transform: {
      filter: {
        id: {
          // $ omitted in case these have query params
          include: [/\.js/, /\.gjs/, /\.ts/, /\.gts/],
          exclude: [/\.json/],
        },
      },
      async handler(code, id) {
        /**
         * NOTE: this way of getting the extension isn't bullet proof, but happens to work for this app
         *       (query params could have . in them)
         */
        const ext = id.split('.').at(-1);
        const lang = ext === 'gjs' ? 'js' : ext === 'gts' ? 'ts' : ext;

        // const estree = this.parse(code, { lang });
        const estree = await oxcParse(id, code, { lang });

        let hasDecorators = false;
        let hasBabelRequiredImport = false;

        walk(
          estree.program,
          /* state */ {},
          {
            Decorator(_node, { stop }) {
              hasDecorators = true;
              stop();
            },
            ImportDeclaration(node, { stop }) {
              if (babelMacros.has(node.source.value)) {
                hasBabelRequiredImport = true;
                stop();
              }
            },
          }
        );

        // env.t++;

        if (hasDecorators || hasBabelRequiredImport) {
          // env.i++;

          const result = await original.transform(code, id);

          return result;
        }

        // All of these can be handle by the default compiler
        if (ext === 'js' || ext === 'gjs' || ext === 'ts') {
          return;
        }

        // What remains: gts that happens to not have <template>
        const result = await transform(id, code, {
          lang,
          typescript: {
            onlyRemoveTypeImports: true,
            allowNamespaces: false,
            removeClassFieldsWithoutInitializer: false,
            rewriteImportExtensions: false,
          },
        });

        if (result.errors?.length) {
          console.error(`Errors during oxc-tranform of ${id}`);

          for (const err of result.errors) {
            if (err.labels) console.error(err.labels);
            console.error(err.codeframe || err.message);
          }

          throw new Error();
        }

        return result;
      },
    },
  };
}

function rolldownTemplateTag() {
  const plugin = templateTag();

  return {
    ...plugin,
    transform: {
      filter: {
        id: [/\.gjs/, /\.gts/],
      },
      handler: plugin.transform,
    },
  };
}

function rolldownEmberConfig() {
  return {
    name: 'limber:rolldown-config',
    async config(config, env) {
      // mutates
      await emberConfig.config(config, env);

      config.oxc = true;
      config.experimental ||= {};
      // Can't use because `__rolldown_runtime__ is not defined`
      // config.experimental.bundledDev = true;
      config.experimental.nativeMagicString = true;
      delete config.esbuild;
      delete config.resolve.extensions;
      delete config.optimizeDeps.esbuildOptions;

      config.optimizeDeps.rolldownOptions ||= {};
      config.optimizeDeps.rolldownOptions.tsconfig = true;
      config.optimizeDeps.rolldownOptions.plugins = [
        rolldownTemplateTag(),
        resolver({ rolldown: true }),
        // Libraries will have precompileTemplate and macros, etc,
        // and we need to compile that away using this app's
        // template compiler
        maybeBabel({ env }),
      ];
    },
  };
}

export default defineConfig((env) => {
  return {
    build: {
      rolldownOptions: {
        treeshake: true,
      },
    },
    css: process.env.__VITE_EMBER_SSG_CHILD__
      ? { postcss: { plugins: [] } }
      : { postcss: './config/postcss.config.mjs' },
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
      /**
       * normally this is the ember() plugin
       */
      [
        resolver({ rolldown: true }),
        rolldownTemplateTag(),
        /**
         * wraps the config edits from the ember plugin,
         * and then edits the config, for better filtering.
         */
        rolldownEmberConfig(),
      ],
      maybeBabel({ env }),
      // Polyfill browser globals not yet in vite-ember-ssr's
      // BROWSER_GLOBALS list (accessed at module scope by Ember packages).
      {
        name: 'ssg-globals-polyfill',
        async closeBundle() {
          // eslint-disable-next-line n/no-unsupported-features/node-builtins
          if (globalThis.localStorage) return;

          const { Window } = await import('happy-dom');
          const w = new Window({ url: 'http://localhost' });

          for (const k of [
            'localStorage',
            'sessionStorage',
            'InputEvent',
            'KeyboardEvent',
            'MouseEvent',
            'FocusEvent',
            'PointerEvent',
            'IntersectionObserver',
            'ResizeObserver',
            'CSSStyleSheet',
            'MediaQueryList',
          ]) {
            try {
              globalThis[k] = w[k];
            } catch {
              /* non-configurable */
            }
          }
        },
      },
      // Strip the app shell from dist/index.html before emberSsg
      // reads it as the SSG template, then restore it after so the
      // SPA fallback still has the loading skeleton.
      // Guard with `ran` — Vite 8 calls closeBundle per environment.
      (() => {
        let ran = false;
        const APP_SHELL_RE =
          /<div id="initial-loader">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<script>[\s\S]*?<\/script>/;

        return {
          name: 'ssg-strip-app-shell',
          async closeBundle() {
            if (ran || process.env.__VITE_EMBER_SSG_CHILD__) return;
            ran = true;

            const { readFile, writeFile, copyFile } = await import('node:fs/promises');
            const { join } = await import('node:path');
            const distDir = join(process.cwd(), 'dist');
            const indexPath = join(distDir, 'index.html');
            const backupPath = join(distDir, '_index_with_shell.html');

            try {
              await copyFile(indexPath, backupPath);

              let html = await readFile(indexPath, 'utf-8');

              html = html.replace(APP_SHELL_RE, '');

              // Move CSS <link> tags before the SSR head marker so the
              // browser starts loading stylesheets immediately, instead
              // of after hundreds of lines of SSR-injected <head> content.
              const cssLinks = [];

              html = html.replace(/<link rel="stylesheet"[^>]*>/g, (m) => {
                cssLinks.push(m);

                return '';
              });

              if (cssLinks.length) {
                html = html.replace(
                  '<!-- VITE_EMBER_SSR_HEAD -->',
                  cssLinks.join('\n    ') + '\n    <!-- VITE_EMBER_SSR_HEAD -->'
                );
              }

              await writeFile(indexPath, html, 'utf-8');
            } catch {
              /* dist/index.html may not exist */
            }
          },
        };
      })(),
      (() => {
        let ran = false;
        const ssg = emberSsg({
          routes: [
            'docs',
            'docs/editor',
            'docs/embedding',
            'docs/ember-repl',
            'docs/repl-sdk',
            'docs/related',
          ],
          ssrEntry: 'app/app-ssr.ts',
          additionalNoExternal: [/./],
        });
        const orig = ssg.closeBundle;

        ssg.closeBundle = async function (...a) {
          if (ran) return;
          ran = true;

          try {
            await orig.apply(this, a);
          } finally {
            // Always restore original index.html (with app shell) for SPA routes
            const { copyFile, rm } = await import('node:fs/promises');
            const { join } = await import('node:path');
            const distDir = join(process.cwd(), 'dist');

            try {
              await copyFile(join(distDir, '_index_with_shell.html'), join(distDir, 'index.html'));
              await rm(join(distDir, '_index_with_shell.html'));
            } catch {
              /* backup may not exist */
            }
          }
        };

        return ssg;
      })(),
    ].flat(),
  };
});
