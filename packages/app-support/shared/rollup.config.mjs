// @ts-nocheck
import { Addon } from '@embroider/addon-dev/rollup';

import { babel } from '@rollup/plugin-babel';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';

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
    // keepAssets in addon-dev 8+ only emits assets reachable from an import,
    // and theme.css is a standalone export. Copy at writeBundle, after
    // addon.clean() has removed everything outside the bundle at generateBundle.
    copy({
      targets: [{ src: 'src/theme.css', dest: 'dist' }],
      hook: 'writeBundle',
    }),
    addon.declarations('declarations', 'tsc --runExternalCode'),
    addon.clean(),
  ],
});
