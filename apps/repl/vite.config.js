import { ember, extensions, resolver, templateTag } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import circleDependency from 'vite-plugin-circular-dependency';
import mkcert from 'vite-plugin-mkcert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const babelRequiredImports = [
  // Templates
  '@ember/template-compiler',
  '@ember/template-compilation',
  'ember-cli-htmlbars',
  'ember-cli-htmlbars-inline-precompile',
  'htmlbars-inline-precompile',

  // Macros
  '@embroider/macros',
  '@glimmer/env',
  '@ember/debug',
  '@ember/application/deprecations',
];

export function maybeBabel(config) {
  const extensions = config.extensions;
  const idRegex = new RegExp(`(${extensions.map((ext) => ext.replace('.', '\\.')).join('|')})$`);

  const original = babel(config);

  return [
    {
      ...original,
      name: 'limber:maybeBabel:js-ts',
      transform: {
        filter: {
          code: [
            babelRequiredImports.map(
              (importPath) => new RegExp(`from\\s+['"]${importPath.replace('/', '\\/')}['"]`)
            ),
          ],
        },
        async handler(code, id) {
          return original.transform.call(this, code, id);
        },
      },
    },
    {
      ...original,
      name: 'limber:maybeBabel:gjs-gts',
      transform: {
        filter: {
          id: idRegex,
        },
        async handler(code, id) {
          return original.transform.call(this, code, id);
        },
      },
    },
  ];
}

function patchPlugins() {
  return {
    name: 'limber:rolldown-optimize',
    config(config, { command }) {
      const isServe = command === 'serve';

      if (!isServe) return;

      config.experimental ||= {};
      config.experimental.bundledDev = true;
      config.oxc = true;

      function rolldownTemplateTag() {
        const plugin = templateTag();

        return {
          ...plugin,
          transform: {
            filter: {
              id: [/\.gjs.*/, /\.gts.*/],
            },
            handler: plugin.transform,
          },
        };
      }

      config.plugins = config.plugins.flat().map((plugin) => {
        if (plugin.name === 'embroider-template-tag') {
          return rolldownTemplateTag(plugin);
        }

        return plugin;
      });

      // config.optimizeDeps.rolldownOptions.plugins = [
      //   rolldownTemplateTag(),
      //   maybeBabel({
      //     babelHelpers: 'runtime',
      //     extensions,
      //     configFile: require.resolve('./babel.config.mjs'),
      //   }),
      //   resolver({ rolldown: true })
      // ];
    },
  };
}

export default defineConfig(() => ({
  // resolve: {
  //   extensions,
  // },
  build: {
    rolldownOptions: {
      treeshake: true,
    }
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
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
      configFile: require.resolve('./babel.config.mjs'),
    }),
    patchPlugins(),
  ],
}));
