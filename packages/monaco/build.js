'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs').promises;
const copy = require('recursive-copy');
const esbuild = require('esbuild');
const { esBuildBrowserTargets } = require('@nullvoxpopuli/limber-consts');

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

/**
 * - Builds Web Workers
 * - Builds a preconfigured bundle with monaco-editor
 * - Copies tall relevant CSS to the same output folder
 */
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
    target: esBuildBrowserTargets,
    minify: false,
    sourcemap: false,
  });

  await esbuild.build({
    loader: { '.ts': 'ts', '.js': 'js', '.ttf': 'file' },
    entryPoints: [path.join('preconfigured', 'index.ts')],
    bundle: true,
    outfile: path.join(buildDir, 'preconfigured.js'),
    format: 'esm',
    target: esBuildBrowserTargets,
    // something silly is going on with Monaco and esbuild
    // TODO: report this to ESBuild's GitHub
    minify: false,
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

  // TODO: how to change the monaco config to allow this to be in a `monaco/` folder
  // const ICON_PATH = 'base/browser/ui/codicons/codicon/codicon.ttf';
  // await copy(path.join(ME, 'esm/vs', ICON_PATH), ICON_PATH)
};

if (require.main === module) {
  module.exports();
}
