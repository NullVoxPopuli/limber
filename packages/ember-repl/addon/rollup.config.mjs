// @ts-nocheck
import ts from 'rollup-plugin-ts';
import { Addon } from '@embroider/addon-dev/rollup';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'rollup';

import { glimmerTemplateTag } from 'rollup-plugin-glimmer-template-tag';

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
    addon.publicEntrypoints(['**/*.js']),
    addon.appReexports([]),

    ts({
      transpiler: 'babel',
      transpileOnly: true,
      babelConfig: './babel.config.json',
      browserslist: ['last 2 firefox versions', 'last 2 chrome versions'],
    }),

    addon.dependencies(),
    addon.hbs(),
    glimmerTemplateTag({ preprocessOnly: true }),
    addon.clean(),
  ],
});
