// Vite support for the TypeScript 7 worker in the editor.
//
// Two things land next to the app, at fixed names:
//
// - `ts7-worker.js`: the worker, built as its own bundle. Vite's worker
//   support runs the app's close hooks for the worker bundle too, which
//   breaks the SSG plugin, so the worker is built separately.
// - `ts7/tsc.wasm.json` and its parts: TypeScript itself, from
//   @nullvoxpopuli/tsc-wasm. Cloudflare Pages caps one asset at 25 MiB,
//   and the module is about 48 MB, so it ships in parts that the worker
//   joins.
//
// The type declarations the checker reads are npm packages, installed into
// the REPL's file system at runtime like any other. The app tells the client
// which versions through a define, so that they match its own.
//
// The content mapper and Glint's transform are Node code. Inside the worker,
// two Node built-ins get browser stand-ins, and two wasm-backed dependencies
// come from esm.sh instead of the bundle.

import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');
const nodeModules = resolve(appRoot, 'node_modules');
const typescriptDir = resolve(appRoot, 'app/templates/edit/editor/typescript');

const WORKER_FILE = 'ts7-worker.js';
const WASM_DIR = 'ts7';
const WASM_MANIFEST = 'tsc.wasm.json';
const WASM_PART_BYTES = 20 * 1024 * 1024;

/**
 * What a gts document can import without installing anything, plus the
 * content mapper and its Glint, which the checker reads too.
 */
const TYPE_PACKAGES = [
  'ember-source',
  '@glimmer/component',
  '@glint/template',
  '@glint/ember-tsc',
  'ember-content-mapper',
];

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

function typePackages() {
  const versions = {};

  for (const name of TYPE_PACKAGES) {
    versions[name] = manifest(packageDir(name)).version;
  }

  return versions;
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

function wasmSource() {
  const dir = packageDir('@nullvoxpopuli/tsc-wasm');
  const file = join(dir, 'dist/tsc.wasm');

  if (!existsSync(file)) {
    throw new Error(
      `${file} is missing. Run \`pnpm --filter @nullvoxpopuli/tsc-wasm build:wasm\` first.`
    );
  }

  return { file, version: manifest(dir).version };
}

/**
 * Splits the module into parts and describes them in a manifest.
 * Returns the manifest.
 */
function writeWasmParts(outDir) {
  const { file, version } = wasmSource();
  const bytes = readFileSync(file);
  const dir = join(outDir, WASM_DIR);
  const parts = [];

  mkdirSync(dir, { recursive: true });

  for (let offset = 0; offset < bytes.byteLength; offset += WASM_PART_BYTES) {
    const name = `tsc.wasm.${parts.length}`;

    writeFileSync(join(dir, name), bytes.subarray(offset, offset + WASM_PART_BYTES));
    parts.push(name);
  }

  const description = { version, size: bytes.byteLength, parts };

  writeFileSync(join(dir, WASM_MANIFEST), JSON.stringify(description));

  return description;
}

export function ts7() {
  let config;
  let outDir;

  return {
    name: 'ts7',
    config() {
      return { define: { __TS7_PACKAGES__: JSON.stringify(typePackages()) } };
    },
    configResolved(resolved) {
      config = resolved;
      outDir = resolve(resolved.root, resolved.build.outDir);
    },
    configureServer(server) {
      const devDir = resolve(nodeModules, '.vite/ts7');
      let workerBuilt;

      let wasmParts;

      server.middlewares.use(`/${WASM_DIR}/`, (request, response, next) => {
        wasmParts ??= writeWasmParts(devDir);

        const name = request.url.slice(1);

        if (name !== WASM_MANIFEST && !wasmParts.parts.includes(name)) return next();

        response.setHeader(
          'content-type',
          name === WASM_MANIFEST ? 'application/json' : 'application/wasm'
        );
        response.end(readFileSync(join(devDir, WASM_DIR, name)));
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

      writeWasmParts(outDir);
      await buildWorker(outDir, config.mode);
    },
  };
}
