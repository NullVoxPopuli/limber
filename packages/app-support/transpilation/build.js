'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const esbuild = require('esbuild');

const appFolder = path.join(__dirname, '..', 'app');
const workerRoot = path.join(appFolder, 'workers');

function detectWorkers() {
  const workers = {};
  const dir = fs.readdirSync(workerRoot);

  for (let i = 0; i < dir.length; i++) {
    const name = dir[i];

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
  const inputs = detectWorkers();
  const workerBuilder = configureWorkerTree(env);

  // separate build from ember, will be detached, won't watch
  Object.entries(inputs).map(workerBuilder);
}

function workersFunnel({ isProduction }) {
  const buildDir = fs.mkdtempSync(path.join(os.tmpdir(), 'limber--workers'));

  const options = {
    isProduction,
    buildDir,
  };

  // outputs {buildDir}/highlighting.js
  buildWorkers(options);
}

module.exports = {
  workersFunnel,
};
