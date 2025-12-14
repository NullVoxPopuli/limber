import { ember, extensions, resolver, templateTag } from '@embroider/vite';
import { createRequire } from 'node:module';

import { babel } from '@rollup/plugin-babel';
import { parse as oxcParse } from 'oxc-parser';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
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

const babelFilter = {
  code: [
    /precompileTemplate/,
    /macroCondition/,
    /@action/,
    /@tracked/,
    /@action\s+[a-zA-Z0-0]+/,
    /@tracked\s+[a-zA-Z0-0]+/,
    /@cached\s+[a-zA-Z0-0]+/,
    // We don't use from "<path>" for the regex
    // because the paths can be re-written by the time babel
    // would be able to parse them
    ...babelRequiredImports.map((importPath) => new RegExp(RegExp.escape(importPath))),
  ],
};

import { transform } from 'oxc-transform';

function maybeBabel(options = {}) {
  const env = options?.env ?? {};
  const babelMacros = new Set(babelRequiredImports);
  const original = babel({
    babelHelpers: 'runtime',
    extensions,
    configFile: require.resolve('./babel.config.mjs'),
  });

  if (env.mode === 'development') {
    babelMacros.delete('@ember/assert');
  }

  env.i ||= 0;
  env.t ||= 0;

  return {
    ...original,
    name: 'limber:babel',
    enforce: 'pre',
    buildEnd() {
      console.debug({ i: env.i, t: env.t });
    },
    transform: {
      filter: {
        id: [/\.js/, /\.gjs/, /\.ts/, /\.gts/],
      },
      async handler(code, id) {
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
            // PropertyDefinition
            // MethodDefinition (methods and getters)
            // node.decorators.length
            Decorator() {
              hasDecorators = true;
            },
            ImportDeclaration(node) {
              if (babelMacros.has(node.source.value)) {
                hasBabelRequiredImport = true;
              }
            },
          }
        );

        env.t++;

        if (hasDecorators || hasBabelRequiredImport) {
          env.i++;

          const result = await original.transform(code, id);

          // if (id.includes('editor-text')) {
          //   console.log(
          //     id,
          //     result.code,
          //     result.code.includes('oxc-project') && 'oxc got to it first :('
          //   );
          // }

          return result;
        }

        return transform(id, code, {
          typescript: {
            onlyRemoveTypeImports: true,
            allowNamespaces: false,
            removeClassFieldsWithoutInitializer: false,
            rewriteImportExtensions: false,
          },
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
        // Libraries will have precompileTemplate and macros, etc,
        // and we need to compile that away using this app's
        // template compiler
        maybeBabel({ env }),
      ];
    },
  };
}

// eslint-disable-next-line no-unused-vars
export default defineConfig((env) => {
  return {
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
      // NOTE: for some reason this isn't loading some files
      // maybeBabel({ env }),
      (() => {
        const plugin = babel({
          babelHelpers: 'runtime',
          extensions,
          configFile: require.resolve('./babel.config.mjs'),
        });

        // If we don't set this, then rolldown processes the TS files first.
        // Which is a problem because it does decorators not how we want (stage 1)
        plugin.enforce = 'pre';

        return plugin;
      })(),
    ].flat(),
  };
});
