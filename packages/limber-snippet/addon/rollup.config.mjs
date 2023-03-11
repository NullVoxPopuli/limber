// @ts-nocheck
import ts from 'rollup-plugin-ts';
import { Addon } from '@embroider/addon-dev/rollup';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'rollup';

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
      babelConfig: './babel.config.json',
      browserslist: ['last 2 firefox versions', 'last 2 chrome versions'],
    }),

    // Follow the V2 Addon rules about dependencies. Your code can import from
    // `dependencies` and `peerDependencies` as well as standard Ember-provided
    // package names.
    addon.dependencies(),

    // Ensure that standalone .hbs files are properly integrated as Javascript.
    addon.hbs(),

    // Start with a clean output directory before building
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
