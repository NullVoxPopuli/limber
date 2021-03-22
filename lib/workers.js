'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const esbuild = require('esbuild');

const appFolder = path.join(__dirname, '..', 'app');
const workerRoot = path.join(appFolder, 'workers');

const Funnel = require('broccoli-funnel');

function detectWorkers() {
  let workers = {};
  let dir = fs.readdirSync(workerRoot);

  for (let i = 0; i < dir.length; i++) {
    let name = dir[i];

    workers[name] = path.join(workerRoot, name, 'index.js');
  }

  return workers;
}

function configureWorkerTree({ isProduction, buildDir }) {
  return ([name, entryPath]) => {
    esbuild.buildSync({
      loader: { '.ts': 'ts', '.js': 'js' },
      entryPoints: [entryPath],
      bundle: true,
      outfile: path.join(buildDir, `${name}.js`),
      format: 'esm',
      minify: isProduction,
      sourcemap: !isProduction,
      // incremental: true,
      // tsconfig: path.join(appFolder, 'tsconfig.json'),
    });
  };
}

function buildWorkers(env) {
  let inputs = detectWorkers();
  let workerBuilder = configureWorkerTree(env);

  // separate build from ember, will be detached, won't watch
  Object.entries(inputs).map(workerBuilder);
}

function workersFunnel({ isProduction }) {
  let buildDir = fs.mkdtempSync(path.join(os.tmpdir(), 'limber--workers'));

  let options = {
    isProduction,
    buildDir,
  };

  // outputs {buildDir}/highlighting.js
  buildWorkers(options);

  return new Funnel(buildDir, {
    destDir: 'workers/',
  });
}

module.exports = {
  workersFunnel,
};
