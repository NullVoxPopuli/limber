import { buildMacros } from '@embroider/macros/babel';
import { ember, extensions, resolver } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import icons from 'unplugin-icons/vite';
import { defineConfig, withFilter } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import circleDependency from 'vite-plugin-circular-dependency';
import mkcert from 'vite-plugin-mkcert';

const macros = buildMacros();

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
      '@nullvoxpopuli/limber-shared',
      'limber-ui',
      'ember-repl',
      'repl-sdk',
    ],
    // These dependencies are *always*
    // needed on initial load.
    // So we can boost initial load perf by eagerly optimizing them instead of waiting for the module graph crawl
    include: [
      // Our Runtime
      '@shikijs/rehype/core',
      'shiki/core',
      'shiki/langs/*',
      'shiki/wasm',
      'shiki/themes/github-*',
      // Framework
      // 'ember-source/@ember/**/*',
      // Theme and Syntax
      '@codemirror/language',
      '@codemirror/view',
      // REPL + Editor
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
    // {
    //   name: 'inspect resolve',
    //   resolveId(id) {
    //     console.log(id);
    //   },
    // },
    {
      /**
       * See: https://github.com/embroider-build/embroider/issues/2548
       */
      async config(config, { command }) {
        const isServe = command === 'serve';

        delete config.build.rollupOptions.input.tests;

        config.oxc = true;
        config.esbuild = true;
        delete config.optimizeDeps.esbuildOptions;

        config.optimizeDeps.rolldownOptions.plugins = [
          withFilter(
            babel({
              babelHelpers: 'runtime',
              extensions,
              plugins: [
                ...(isServe
                  ? []
                  : [
                      [
                        '@babel/plugin-transform-typescript',
                        {
                          allExtensions: true,
                          onlyRemoveTypeImports: true,
                          allowDeclareFields: true,
                        },
                      ],
                    ]),
                [
                  'babel-plugin-ember-template-compilation',
                  {
                    compilerPath: 'ember-source/dist/ember-template-compiler.js',
                    enableLegacyModules: [
                      'ember-cli-htmlbars',
                      'ember-cli-htmlbars-inline-precompile',
                      'htmlbars-inline-precompile',
                    ],
                    transforms: [...macros.templateMacros],
                  },
                ],
                // Needed until we move to spec decorators
                [
                  'module:decorator-transforms',
                  {
                    runtime: {
                      import: import.meta.resolve('decorator-transforms/runtime-esm'),
                    },
                  },
                ],
                // needed because we use babel :(
                [
                  '@babel/plugin-transform-runtime',
                  {
                    absoluteRuntime: import.meta.dirname,
                    useESModules: true,
                    regenerator: false,
                  },
                ],
                ...macros.babelMacros,
              ],
            }),
            { load: { id: /\.js$/ } }
          ),
        ];
      },
    },
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
}));
