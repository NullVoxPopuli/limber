'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const esbuild = require('esbuild');

const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

const nm = path.join(__dirname, '../../node_modules/');
const cssLocation = path.join(`${nm}monaco-editor/min/vs/editor`);

const workers = {
  base: path.join(nm, 'monaco-editor/esm/vs/editor/editor.main.js'),
  editor: path.join(nm, 'monaco-editor/esm/vs/editor/editor.worker.js'),
  json: path.join(nm, 'monaco-editor/esm/vs/language/json/json.worker.js'),
  css: path.join(nm, 'monaco-editor/esm/vs/language/css/css.worker.js'),
  html: path.join(nm, 'monaco-editor/esm/vs/language/html/html.worker.js'),
  ts: path.join(nm, 'monaco-editor/esm/vs/language/typescript/ts.worker.js'),
};

function buildWorkers({ isProduction }) {
  let buildDir = fs.mkdtempSync(path.join(os.tmpdir(), 'monaco--workers'));

  esbuild.buildSync({
    loader: { '.ts': 'ts', '.js': 'js' },
    entryPoints: [
      workers.editor,
      workers.json,
      workers.css,
      workers.html,
      workers.ts,
      workers.base,
    ],
    bundle: true,
    // watch seems to halt the broccoli build?
    // watch: true,
    outdir: buildDir,
    format: 'esm',
    minify: isProduction,
    sourcemap: false,
  });

  return new Funnel(buildDir, {
    destDir: 'monaco/',
    exclude: ['*.nls.*'],
  });
}

function monacoFunnel(options) {
  let src = buildWorkers(options);

  // let src = new Funnel(monacoLocation, {
  //   destDir: 'monaco/',
  //   // exclude: ['*.nls.*'],
  // });

  let css = new Funnel(cssLocation, {
    destDir: 'monaco/',
    include: ['*.css'],
  });

  return mergeTrees([src, css]);
}

module.exports = {
  monacoFunnel,
};
