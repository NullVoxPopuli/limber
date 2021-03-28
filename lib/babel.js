'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const esbuild = require('esbuild');
// plugins cannot be used with sync apis.....
// broccoli-funnel only works with sync.... ugh
const alias = require('esbuild-plugin-alias');

const Funnel = require('broccoli-funnel');

const appFolder = path.join(__dirname, '..');
const babelLocation = path.join(appFolder, 'babel-compiler', 'index.ts');

async function babelFunnel({ isProduction }) {
  let buildDir = fs.mkdtempSync(path.join(os.tmpdir(), 'babel-compiler'));

  await esbuild.build({
    loader: { '.ts': 'ts', '.js': 'js' },
    entryPoints: [babelLocation],
    bundle: true,
    outdir: buildDir,
    format: 'cjs',
    minify: isProduction,
    sourcemap: false,
    // watch seems to halt the broccoli build?
    // watch: true,
    external: ['v8', 'path'],
    tsconfig: path.join(appFolder, 'tsconfig.json'),
    plugins: [
      alias({
        '@ember/template-compilation': 'node_modules/ember-source/dist/ember-template-compiler.js',
      }),
    ],
  });

  return new Funnel(buildDir, {
    destDir: 'babel/',
    include: ['*.js'],
  });
}

module.exports = {
  babelFunnel,
};
