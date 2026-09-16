// Vite support for the TypeScript 7 worker in the editor.
//
// Two files land next to the app, at fixed names:
//
// - `ts7-worker.js`: the worker, built as its own bundle. Vite's worker
//   support runs the app's close hooks for the worker bundle too, which
//   breaks the SSG plugin, so the worker is built separately.
// - `ts7-types.json`: the type declarations the worker's virtual project
//   needs, collected from node_modules so that they match the app's
//   dependencies.
//
// The content mapper and Glint's transform are Node code. Inside the worker,
// two Node built-ins get browser stand-ins, and two wasm-backed dependencies
// come from esm.sh instead of the bundle.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');
const nodeModules = resolve(appRoot, 'node_modules');
const typescriptDir = resolve(appRoot, 'app/templates/edit/editor/typescript');

const WORKER_FILE = 'ts7-worker.js';
const TYPES_FILE = 'ts7-types.json';
const PROJECT = '/project';

function manifest(dir) {
  return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
}

function packageDir(name) {
  return realpathSync(join(nodeModules, name));
}

/**
 * A dependency of @glint/ember-tsc, which pnpm keeps next to it.
 */
function emberTscDependencyDir(name) {
  return resolve(packageDir('@glint/ember-tsc'), '../..', name);
}

/**
 * Every declaration file under `dir`, keyed by its path in the virtual project.
 */
function collect(name, subdir, files) {
  const base = packageDir(name);
  const start = subdir ? join(base, subdir) : base;

  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules') continue;

      const path = join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(path);
      } else if (/\.d\.[cm]?ts$/.test(entry.name) || entry.name === 'package.json') {
        files[`${PROJECT}/node_modules/${name}/${relative(base, path)}`] = readFileSync(
          path,
          'utf8'
        );
      }
    }
  };

  walk(start);
  files[`${PROJECT}/node_modules/${name}/package.json`] = readFileSync(
    join(base, 'package.json'),
    'utf8'
  );
}

let cachedTypes;

function types() {
  if (cachedTypes) return cachedTypes;

  const files = {};

  collect('ember-source', 'types', files);
  collect('@glint/ember-tsc', 'types', files);
  collect('@glint/template', undefined, files);
  collect('@glimmer/component', undefined, files);
  files[`${PROJECT}/node_modules/ember-content-mapper/package.json`] = JSON.stringify(
    manifest(packageDir('ember-content-mapper'))
  );

  const versions = {
    emberSource: manifest(packageDir('ember-source')).version,
    emberTsc: manifest(packageDir('@glint/ember-tsc')).version,
    mapper: manifest(packageDir('ember-content-mapper')).version,
  };

  cachedTypes = JSON.stringify({ versions, files });

  return cachedTypes;
}

function workerShims() {
  const shim = resolve(typescriptDir, 'node-module-shim.js');
  const fromEsmSh = {
    'ember-estree': manifest(emberTscDependencyDir('ember-estree')).version,
    'content-tag': manifest(emberTscDependencyDir('content-tag')).version,
  };

  return {
    name: 'ts7:worker-shims',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'node:module') return shim;
      if (id === 'node:path') return this.resolve('path-browserify');

      const version = fromEsmSh[id];

      if (version) {
        return { id: `https://esm.sh/${id}@${version}`, external: true };
      }

      return null;
    },
  };
}

async function buildWorker(outDir, mode) {
  await build({
    configFile: false,
    root: appRoot,
    mode,
    logLevel: 'warn',
    plugins: [workerShims()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
    build: {
      target: 'esnext',
      outDir,
      emptyOutDir: false,
      copyPublicDir: false,
      minify: mode === 'production',
      lib: {
        entry: resolve(typescriptDir, 'worker.js'),
        formats: ['es'],
        fileName: () => WORKER_FILE,
      },
    },
  });
}

export function ts7() {
  let config;
  let outDir;

  return {
    name: 'ts7',
    config() {
      return {
        define: {
          __TSC_WASM_VERSION__: JSON.stringify(
            manifest(packageDir('@nullvoxpopuli/tsc-wasm')).version
          ),
        },
      };
    },
    configResolved(resolved) {
      config = resolved;
      outDir = resolve(resolved.root, resolved.build.outDir);
    },
    configureServer(server) {
      const devDir = resolve(nodeModules, '.vite/ts7');
      let workerBuilt;

      server.middlewares.use(`/${TYPES_FILE}`, (_request, response) => {
        response.setHeader('content-type', 'application/json');
        response.end(types());
      });

      server.middlewares.use(`/${WORKER_FILE}`, async (_request, response) => {
        workerBuilt ??= buildWorker(devDir, config.mode);
        await workerBuilt;
        response.setHeader('content-type', 'text/javascript');
        response.end(readFileSync(join(devDir, WORKER_FILE)));
      });
    },
    async writeBundle() {
      if (config.build.ssr) return;
      if (process.env.__VITE_EMBER_SSG_CHILD__) return;

      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

      writeFileSync(join(outDir, TYPES_FILE), types());
      await buildWorker(outDir, config.mode);
    },
  };
}
