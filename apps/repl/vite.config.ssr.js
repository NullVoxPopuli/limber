import { ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { emberSsr } from 'vite-ember-ssr/vite-plugin';

export default defineConfig({
  plugins: [
    ember(),
    babel({
      babelHelpers: 'runtime',
      skipPreflightCheck: true,
      extensions,
      configFile: './babel.config.mjs',
    }),
    emberSsr({ appName: 'limber' }),
    icons({ autoInstall: true }),
  ],
  css: {
    postcss: './config/postcss.config.mjs',
  },
  build: {
    target: 'node22',
    outDir: 'dist/server',
    sourcemap: true,
    minify: false,
    ssr: 'app/app-ssr.ts',
  },
  ssr: {
    // Bundle everything to avoid CJS/ESM interop issues in Node
    noExternal: true,
  },
});
