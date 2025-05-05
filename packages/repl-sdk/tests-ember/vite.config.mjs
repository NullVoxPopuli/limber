import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import { createRequire } from 'node:module';
import {
  resolver,
  hbs,
  scripts,
  templateTag,
  optimizeDeps,
  compatPrebuild,
  assets,
  contentFor,
} from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
const require = createRequire(import.meta.url);

const extensions = [
  '.mjs',
  '.gjs',
  '.js',
  '.mts',
  '.gts',
  '.ts',
  '.hbs',
  '.json',
];

const optimization = optimizeDeps();

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      extensions,
      alias: {
        'ember-template-compiler': 'ember-source/dist/ember-template-compiler',
        // 'content-tag': import.meta.resolve('content-tag'),
        // The fact that this is required
        // reveals a problem with babel-plugin-debug-macros.
        // *Nothing* should be touching path.
        path: 'path-browserify',
      },
    },
    plugins: [
      // wasm(),
      hbs(),
      templateTag(),
      scripts(),
      resolver(),
      compatPrebuild(),
      assets(),
      contentFor(),

      babel({
        babelHelpers: 'runtime',
        extensions,
      }),
    ],

    optimizeDeps: {
      ...optimization,
      exclude: ['content-tag', ...optimization.exclude],
      esbuildOptions: {
        ...optimization.esbuildOptions,
        target: 'esnext',
        plugins: [
          {
            name: 'deal-with-weird-pre-official-runtime-compiler',
            setup(build) {
              build.onResolve({ filter: /content-tag/ }, (path) => ({
                path: 'content-tag',
                external: true,
              }));
            },
          },
          ...optimization.esbuildOptions.plugins,
        ],
      },
    },
    server: {
      port: 4200,
      mimeTypes: {
        'application/wasm': ['wasm'],
      },
    },
    esbuild: {
      target: 'esnext',
      supported: {
        'top-level-await': true,
      },
    },
    build: {
      outDir: 'dist',
      target: 'esnext',
      rollupOptions: {
        input: {
          main: 'index.html',
          ...(shouldBuildTests(mode)
            ? { tests: 'tests/index.html' }
            : undefined),
        },
      },
    },
  };
});

function shouldBuildTests(mode) {
  return mode !== 'production' || process.env.FORCE_BUILD_TESTS;
}
