'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const esbuild = require('esbuild');

const appFolder = path.join(__dirname, '..', 'app');

const Funnel = require('broccoli-funnel');

const workers = {
  base: 'monaco-editor/esm/vs/editor/editor.main';
  editor: 'monaco-editor/esm/vs/editor/editor.worker.js',
  json: 'monaco-editor/esm/vs/language/json/json.worker.js',
  css: 'monaco-editor/esm/vs/language/css/css.worker.js',
  html: 'monaco-editor/esm/vs/language/html/html.worker.js',
  ts: 'monaco-editor/esm/vs/language/typescript/ts.worker.js',
};

function monacoFunnel({ isProduction }) {
  let buildDir = fs.mkdtempSync(path.join(os.tmpdir(), 'monaco--workers'));

  esbuild.buildSync({
    loader: { '.ts': 'ts', '.js': 'js' },
    entryPoints: [workers.editor, workers.json, workers.css, workers.html, workers.ts],
    bundle: true,
    outdir: buildDir,
    format: 'cjs',
    minify: isProduction,
    sourcemap: false,
    // incremental: true,
  });

  return new Funnel(buildDir, {
    destDir: 'monaco/',
  });
}

module.exports = {
  monacoFunnel,
};
