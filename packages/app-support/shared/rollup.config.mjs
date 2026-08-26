// @ts-nocheck
import { Addon } from '@embroider/addon-dev/rollup';

import { babel } from '@rollup/plugin-babel';
import { defineConfig } from 'rollup';

import { nodeResolve } from '@rollup/plugin-node-resolve';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

export default defineConfig({
  output: addon.output(),
  plugins: [
    addon.publicEntrypoints(['index.js']),
    addon.dependencies(),
    nodeResolve({ browser: true, modulesOnly: true }),

    babel({
      extensions: ['.js', '.gjs', '.ts', '.gts'],
      babelHelpers: 'bundled',
    }),
    addon.gjs(),
    addon.keepAssets(['**/*.css']),
    addon.declarations('declarations', 'tsc --runExternalCode'),
    addon.clean(),
  ],
});
