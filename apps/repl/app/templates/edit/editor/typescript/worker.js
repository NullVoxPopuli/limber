// Runs TypeScript 7 (compiled to wasm) as a language server.
//
// The main thread talks LSP JSON over postMessage.
// This worker adds the stdio framing, serves the REPL's file system to the
// Go runtime, and hosts the content mapper that the server would normally
// spawn as a process.

import { Storage } from 'repl-sdk/fs/storage';

import '@nullvoxpopuli/tsc-wasm/wasm_exec.js';

import * as mapper from './mapper.js';
import { nodeFs } from './node-fs.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const storage = new Storage();

/**
 * The project is the whole file system: packages under `/node_modules`,
 * the document under `/src`. Only the document is checked.
 * The rest of `/src` is fences and older revisions.
 */
const TSCONFIG = {
  compilerOptions: {
    strict: true,
    module: 'esnext',
    target: 'es2022',
    moduleResolution: 'bundler',
    lib: ['es2022', 'dom', 'dom.iterable'],
    types: [],
    skipLibCheck: true,
    noEmit: true,
    allowImportingTsExtensions: true,
  },
  contentMappers: [{ package: 'ember-content-mapper', extensions: ['.gts', '.gjs'] }],
  files: ['/src/index.gts'],
};

function concat(a, b) {
  const out = new Uint8Array(a.byteLength + b.byteLength);

  out.set(a);
  out.set(b, a.byteLength);

  return out;
}

/**
 * Splits a byte stream with LSP base protocol framing into message bodies.
 * Returns the unconsumed remainder.
 */
function splitFrames(buffer, onMessage) {
  for (;;) {
    const text = decoder.decode(buffer);
    const headerEnd = text.indexOf('\r\n\r\n');

    if (headerEnd === -1) return buffer;

    const match = /Content-Length:\s*(\d+)/i.exec(text.slice(0, headerEnd));

    if (!match) throw new Error(`Bad LSP header: ${text.slice(0, headerEnd)}`);

    const length = Number(match[1]);
    const bodyStart = encoder.encode(text.slice(0, headerEnd + 4)).byteLength;

    if (buffer.byteLength < bodyStart + length) return buffer;

    onMessage(decoder.decode(buffer.subarray(bodyStart, bodyStart + length)));
    buffer = buffer.slice(bodyStart + length);
  }
}

function frame(message) {
  const body = encoder.encode(message);

  return concat(encoder.encode(`Content-Length: ${body.byteLength}\r\n\r\n`), body);
}

/**
 * Requests the server makes of its client that the CodeMirror client does not
 * implement. Answering them here keeps the server's initialization going.
 */
const HOUSEKEEPING = {
  'client/registerCapability': () => null,
  'client/unregisterCapability': () => null,
  'window/workDoneProgress/create': () => null,
  'workspace/configuration': (params) => params.items.map(() => null),
};

let stdout = new Uint8Array(0);
let stderr = '';

const node = nodeFs(storage, {
  onStdout(bytes) {
    stdout = splitFrames(concat(stdout, bytes), fromServer);
  },
  onStderr(bytes) {
    stderr += decoder.decode(bytes);

    const newline = stderr.lastIndexOf('\n');

    if (newline !== -1) {
      postMessage({ type: 'log', text: stderr.slice(0, newline) });
      stderr = stderr.slice(newline + 1);
    }
  },
});

globalThis.fs = node.fs;
globalThis.process = node.process;

function fromServer(message) {
  const parsed = JSON.parse(message);
  const handler = parsed.id !== undefined && parsed.method && HOUSEKEEPING[parsed.method];

  if (!handler) {
    postMessage({ type: 'lsp', message });

    return;
  }

  node.pushStdin(
    frame(JSON.stringify({ jsonrpc: '2.0', id: parsed.id, result: handler(parsed.params) }))
  );
}

/**
 * The server asks for the content mapper through this hook (see spawn_js.go in the
 * TypeScript fork). The mapper is a module in this worker, so "spawning" it means
 * answering its JSON-RPC requests directly.
 */
globalThis.tsc = {
  versions: {},

  spawn(command, dir, onData, onExit) {
    let inbox = new Uint8Array(0);
    const respond = (message) => onData(frame(JSON.stringify(message)));

    async function handle(request) {
      const handler = mapper.handlers[request.method];

      if (!handler) {
        if (request.id !== undefined) {
          respond({
            jsonrpc: '2.0',
            id: request.id,
            error: { code: -32601, message: `Unknown method ${request.method}` },
          });
        }

        return;
      }

      try {
        const result = await handler(request.params);

        if (request.id !== undefined) respond({ jsonrpc: '2.0', id: request.id, result });
      } catch (error) {
        postMessage({
          type: 'log',
          text: `content mapper ${request.method} failed: ${error?.stack ?? error}`,
        });

        if (request.id !== undefined) {
          respond({
            jsonrpc: '2.0',
            id: request.id,
            error: { code: -32603, message: String(error?.message ?? error) },
          });
        }
      }
    }

    return {
      write(bytes) {
        inbox = splitFrames(concat(inbox, bytes), (message) => {
          handle(JSON.parse(message));
        });
      },
      close() {
        onExit(0);
      },
    };
  },
};

/**
 * What the client sends, with two things it cannot say itself.
 *
 * The server refuses to run content mappers unless the client opts in, and
 * the CodeMirror client has no option for that.
 *
 * The document has to be on disk for the project to list it. The REPL writes
 * it there on compile, which is later than the server first looks, and can
 * be a version behind.
 */
function toServer(message) {
  const parsed = JSON.parse(message);

  if (parsed.method === 'initialize') {
    parsed.params.initializationOptions = {
      ...parsed.params.initializationOptions,
      runExternalCode: true,
    };
  }

  if (parsed.method === 'textDocument/didOpen') {
    const { uri, text } = parsed.params.textDocument;

    node.overlay(new URL(uri).pathname, text);
  }

  /**
   * A compile may have installed what the document imports since the last
   * look. Forgetting is cheap, and the server decides what to read again.
   */
  if (parsed.method === 'textDocument/didChange') node.invalidate();

  node.pushStdin(frame(JSON.stringify(parsed)));
}

/**
 * The content mapper asks Node which versions are installed.
 * Here, the file system answers.
 */
async function versionOf(name) {
  const manifest = await storage.read(`/node_modules/${name}/package.json`);

  if (!manifest) throw new Error(`${name} is not installed`);

  return JSON.parse(manifest).version;
}

/**
 * The module ships in parts, because the host caps one asset at 25 MiB.
 * The manifest lists them; they download in parallel and join here.
 */
async function loadWasm(manifestUrl) {
  const response = await fetch(manifestUrl);

  if (!response.ok) {
    throw new Error(`Could not load TypeScript: ${response.status} ${manifestUrl}`);
  }

  const { parts, size } = await response.json();
  const base = new URL(manifestUrl, location.href);
  const buffers = await Promise.all(
    parts.map(async (part) => {
      const partResponse = await fetch(new URL(part, base));

      if (!partResponse.ok) {
        throw new Error(`Could not load TypeScript: ${partResponse.status} ${part}`);
      }

      return new Uint8Array(await partResponse.arrayBuffer());
    })
  );
  const bytes = new Uint8Array(size);
  let offset = 0;

  for (const buffer of buffers) {
    bytes.set(buffer, offset);
    offset += buffer.byteLength;
  }

  return WebAssembly.compile(bytes);
}

async function start({ wasmUrl }) {
  postMessage({ type: 'status', text: 'Loading TypeScript' });

  const [module, emberSource, emberTsc, contentMapper] = await Promise.all([
    loadWasm(wasmUrl),
    versionOf('ember-source'),
    versionOf('@glint/ember-tsc'),
    versionOf('ember-content-mapper'),
  ]);

  globalThis.tsc.versions = { emberSource, emberTsc, mapper: contentMapper };
  mapper.configure(globalThis.tsc.versions);
  node.overlay('/tsconfig.json', JSON.stringify(TSCONFIG));

  const go = new globalThis.Go();

  go.argv = ['tsc', '--lsp', '--stdio'];
  go.env = { HOME: '/' };
  go.exit = (code) => postMessage({ type: 'exit', code });

  const instance = await WebAssembly.instantiate(module, go.importObject);

  postMessage({ type: 'started' });

  await go.run(instance);
}

onmessage = (event) => {
  const data = event.data;

  switch (data.type) {
    case 'start':
      start(data).catch((error) => {
        postMessage({ type: 'error', text: String(error?.stack ?? error) });
      });

      break;
    case 'lsp':
      toServer(data.message);

      break;
  }
};

postMessage({ type: 'ready' });
