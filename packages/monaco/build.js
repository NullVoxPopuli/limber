'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs').promises;
const copy = require('recursive-copy');
const esbuild = require('esbuild');

const OUTPUT_DIR = path.join(__dirname, 'dist').toString();

const ME = path.dirname(require.resolve('monaco-editor/package.json'));

const cssLocation = path.join(`${ME}/min/vs/editor`);

const workers = {
  base: path.join(ME, 'esm/vs/editor/editor.main.js'),
  editor: path.join(ME, 'esm/vs/editor/editor.worker.js'),
  json: path.join(ME, 'esm/vs/language/json/json.worker.js'),
  css: path.join(ME, 'esm/vs/language/css/css.worker.js'),
  html: path.join(ME, 'esm/vs/language/html/html.worker.js'),
  ts: path.join(ME, 'esm/vs/language/typescript/ts.worker.js'),
};

module.exports = async function build() {
  let buildDir = await fs.mkdtemp(path.join(os.tmpdir(), 'monaco--workers-'));

  await esbuild.build({
    loader: { '.ts': 'ts', '.js': 'js', '.ttf': 'file' },
    entryPoints: [
      workers.editor,
      workers.json,
      workers.css,
      workers.html,
      workers.ts,
      workers.base,
    ],
    bundle: true,
    outdir: buildDir,
    format: 'esm',
    minify: true,
    sourcemap: false,
  });

  await copy(`${buildDir}`, OUTPUT_DIR, {
    overwrite: true,
    filter: ['**/*', '!*.nls.*'],
  });

  await copy(`${cssLocation}`, OUTPUT_DIR, {
    overwrite: true,
    filter: ['**/*.css'],
  });
};

if (require.main === module) {
  module.exports();
}
