// Runs TypeScript 7 (compiled to wasm) as a language server.
//
// The main thread talks LSP JSON over postMessage.
// This worker adds the stdio framing, owns the in-memory file system,
// and hosts the content mapper that the server would normally spawn as a process.

import './memfs.js';

import '@nullvoxpopuli/tsc-wasm/wasm_exec.js';

import * as mapper from './mapper.js';

const { memfs } = globalThis;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const PROJECT = '/project';

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
  include: ['**/*'],
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

function fromServer(message) {
  const parsed = JSON.parse(message);
  const handler = parsed.id !== undefined && parsed.method && HOUSEKEEPING[parsed.method];

  if (!handler) {
    postMessage({ type: 'lsp', message });

    return;
  }

  memfs.pushStdin(
    frame(JSON.stringify({ jsonrpc: '2.0', id: parsed.id, result: handler(parsed.params) }))
  );
}

let stdout = new Uint8Array(0);

memfs.stream.onStdout = (bytes) => {
  stdout = splitFrames(concat(stdout, bytes), fromServer);
};

let stderr = '';

memfs.stream.onStderr = (bytes) => {
  stderr += decoder.decode(bytes);

  const newline = stderr.lastIndexOf('\n');

  if (newline !== -1) {
    postMessage({ type: 'log', text: stderr.slice(0, newline) });
    stderr = stderr.slice(newline + 1);
  }
};

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
 * The server refuses to run content mappers unless the client opts in,
 * and the CodeMirror client has no option for that.
 */
function withInitializationOptions(message) {
  const parsed = JSON.parse(message);

  if (parsed.method !== 'initialize') return message;

  parsed.params.initializationOptions = {
    ...parsed.params.initializationOptions,
    runExternalCode: true,
  };

  return JSON.stringify(parsed);
}

async function loadTypes(typesUrl) {
  const response = await fetch(typesUrl);

  if (!response.ok) {
    throw new Error(`Could not load the type declarations: ${response.status} ${typesUrl}`);
  }

  const { versions, files } = await response.json();

  for (const [path, content] of Object.entries(files)) {
    memfs.writeFile(path, content);
  }

  globalThis.tsc.versions = versions;
  mapper.configure(versions);
}

async function start({ wasmUrl, typesUrl }) {
  postMessage({ type: 'status', text: 'Loading type declarations' });
  memfs.writeFile(`${PROJECT}/tsconfig.json`, JSON.stringify(TSCONFIG));
  await loadTypes(typesUrl);

  postMessage({ type: 'status', text: 'Loading TypeScript' });

  const go = new globalThis.Go();

  go.argv = ['tsc', '--lsp', '--stdio'];
  go.env = { HOME: '/' };
  go.exit = (code) => postMessage({ type: 'exit', code });

  const { instance } = await WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject);

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
      memfs.pushStdin(frame(withInitializationOptions(data.message)));

      break;
  }
};

postMessage({ type: 'ready' });
