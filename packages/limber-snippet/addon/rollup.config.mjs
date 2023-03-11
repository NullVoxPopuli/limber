// @ts-nocheck
import ts from 'rollup-plugin-ts';
import { Addon } from '@embroider/addon-dev/rollup';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'rollup';

import gjs from './gjs-plugin.mjs';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

export default defineConfig({
  // https://github.com/rollup/rollup/issues/1828
  watch: {
    chokidar: {
      usePolling: true,
    },
  },
  output: addon.output(),
  plugins: [
    addon.publicEntrypoints(['index.js', '**/*.js']),
    addon.appReexports(['components/**/*.js']),

    ts({
      // can be changed to swc or other transpilers later
      // but we need the ember plugins converted first
      // (template compilation and co-location)
      transpiler: 'babel',
      transpileOnly: true,
      babelConfig: './babel.config.json',
      browserslist: ['last 2 firefox versions', 'last 2 chrome versions'],
    }),

    addon.dependencies(),
    addon.hbs(),
    gjs(),
    addon.keepAssets(['**/*.css']),
    addon.clean(),

    // Copy Readme and License into published package
    copy({
      targets: [
        { src: '../README.md', dest: '.' },
        { src: '../LICENSE.md', dest: '.' },
      ],
    }),
  ],
});
