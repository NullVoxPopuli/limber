import { ember, extensions, resolver, templateTag } from '@embroider/vite';
import { createRequire } from 'node:module';

import { babel } from '@rollup/plugin-babel';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import circleDependency from 'vite-plugin-circular-dependency';
import mkcert from 'vite-plugin-mkcert';

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
  '@ember/debug',
  '@ember/application/deprecations',
];

import { transform } from 'oxc-transform';

function rolldownTS() {
  return {
    name: 'limber:ts',
    transform: {
      filter: {
        id: [/\.ts/, /\.gts/],
      },
      async handler(code, id) {
        const result = await transform(id, code, {
          typescript: {
            onlyRemoveTypeImports: true,
            allowNamespaces: false,
            removeClassFieldsWithoutInitializer: false,
            rewriteImportExtensions: false,
          },
        });

        return result;
      },
    },
  };
}

import { transformAsync } from '@babel/core';

export function maybeBabel() {
  return {
    name: 'limber:maybeBabel',
    transform: {
      filter: {
        code: [
          /precompileTemplate/,
          /@action/,
          /@action\s+[a-zA-Z0-0]+/,
          /@tracked\s+[a-zA-Z0-0]+/,
          /@cached\s+[a-zA-Z0-0]+/,
          // We don't use from "<path>" for the regex
          // because the paths can be re-written by the time babel
          // would be able to parse them
          ...babelRequiredImports.map((importPath) => new RegExp(RegExp.escape(importPath))),
        ],
      },
      async handler(code, id) {
        return transformAsync(code, {
          filename: id,
        });
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
        rolldownTS(),
        // Libraries will have precompileTemplate and macros, etc,
        // and we need to compile that away using this app's
        // template compiler
        maybeBabel({
          babelHelpers: 'runtime',
          extensions,
          configFile: require.resolve('./babel.config.mjs'),
        }),
      ];
    },
  };
}

export default defineConfig(() => ({
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
      'ember-primitives',
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
    babel({
      babelHelpers: 'runtime',
      extensions,
      configFile: require.resolve('./babel.config.mjs'),
    }),
  ].flat(),
}));
