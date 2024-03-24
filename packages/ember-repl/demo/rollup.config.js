import { babel } from '@rollup/plugin-babel';
import { Addon } from '@embroider/addon-dev/rollup';
import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';

const addon = new Addon({
  srcDir: 'src/compiler',
  destDir: 'dist-sw',
});

export default defineConfig({
  output: {
    file: 'sw.js',
    format: 'es',
    sourcemap: true,
    inlineDynamicImports: true,
    name: 'service-worker',
  },
  plugins: [
    addon.publicEntrypoints(['sw.js']),
    babel({
      extensions: ['.ts'],
      babelHelpers: 'bundled',
    }),
    resolve(),
    addon.dependencies(),
  ],
});
