import { join } from 'node:path';

import { defineConfig } from 'rolldown';

export default defineConfig({
  input: './src/index.js',
  platform: 'browser',
  resolve: {
    // Babel 8 is written for node. These are its only two node built-ins.
    alias: {
      'node:path': 'path-browserify',
      'node:assert': join(import.meta.dirname, './src/assert.js'),
    },
  },
  transform: {
    inject: {
      process: join(import.meta.dirname, './src/process.js'),
    },
  },
  output: {
    file: './dist/index.js',
    format: 'esm',
    sourcemap: true,
    // The app that ships this minifies it.
    minify: false,
  },
});
