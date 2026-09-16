import { linter } from '@codemirror/lint';
import { languageServerExtensions, LSPClient, LSPPlugin } from '@codemirror/lsp-client';

import type { Diagnostic } from '@codemirror/lint';
import type { Transport } from '@codemirror/lsp-client';
import type { Extension } from '@codemirror/state';

/**
 * Set by the ts7 vite plugin from the workspace package's version.
 */
declare const __TSC_WASM_VERSION__: string;

const PROJECT_URI = 'file:///project';

/**
 * Formats the type checker understands, and the LSP language id for each.
 */
const LANGUAGES: Record<string, { file: string; languageId: string } | undefined> = {
  gts: { file: 'index.gts', languageId: 'glimmer-ts' },
};

export function hasTypeScript(format: string): boolean {
  return Boolean(LANGUAGES[format]);
}

export type OnStatus = (message: string) => void;

/**
 * The wasm is 11 MB over the wire, so it comes from esm.sh
 * rather than from the app's own assets.
 *
 * Tests and local development can point at another copy through
 * `globalThis.TSC_WASM_URL`.
 */
function wasmUrl(): string {
  const override = (globalThis as { TSC_WASM_URL?: string }).TSC_WASM_URL;

  return override ?? `https://esm.sh/@nullvoxpopuli/tsc-wasm@${__TSC_WASM_VERSION__}/dist/tsc.wasm`;
}

function typesUrl(): string {
  return `${import.meta.env.BASE_URL}ts7-types.json`;
}

type WorkerMessage =
  | { type: 'lsp'; message: string }
  | { type: 'status'; text: string }
  | { type: 'log'; text: string }
  | { type: 'error'; text: string }
  | { type: 'exit'; code: number }
  | { type: 'ready' }
  | { type: 'started' };

function startWorker(onStatus: OnStatus): Promise<{ worker: Worker; transport: Transport }> {
  const worker = new Worker(`${import.meta.env.BASE_URL}ts7-worker.js`, { type: 'module' });
  let handlers: ((value: string) => void)[] = [];

  const debug = (globalThis as { TSC_DEBUG?: boolean }).TSC_DEBUG;
  const trace = (direction: string, message: string) => {
    if (!debug) return;

    const parsed = JSON.parse(message);

    console.debug(
      `[typescript] ${direction} ${parsed.method ?? `response ${parsed.id}`}`,
      message.slice(0, 300)
    );
  };

  const transport: Transport = {
    send(message) {
      trace('->', message);
      worker.postMessage({ type: 'lsp', message });
    },
    subscribe(handler) {
      handlers.push(handler);
    },
    unsubscribe(handler) {
      handlers = handlers.filter((existing) => existing !== handler);
    },
  };

  return new Promise((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const data = event.data;

      switch (data.type) {
        case 'lsp':
          trace('<-', data.message);

          for (const handler of handlers) handler(data.message);

          break;
        case 'status':
          onStatus(data.text);

          break;
        case 'log':
          console.debug(`[typescript] ${data.text}`);

          break;
        case 'ready':
          console.debug('[typescript] worker ready');
          worker.postMessage({ type: 'start', wasmUrl: wasmUrl(), typesUrl: typesUrl() });

          break;
        case 'started':
          resolve({ worker, transport });

          break;
        case 'error':
          reject(new Error(data.text));

          break;
        case 'exit':
          reject(new Error(`TypeScript exited with code ${data.code}`));

          break;
      }
    };

    worker.onerror = (event) => reject(new Error(event.message));
  });
}

let client: Promise<LSPClient> | undefined;

/**
 * One language server per page. The first caller pays for the download.
 */
export function typeScriptClient(onStatus: OnStatus): Promise<LSPClient> {
  client ??= startWorker(onStatus).then(async ({ transport }) => {
    const lsp = new LSPClient({
      rootUri: PROJECT_URI,
      extensions: languageServerExtensions(),
    }).connect(transport);

    await lsp.initializing;
    onStatus('TypeScript ready');

    return lsp;
  });

  client.catch(() => {
    // Let the next call try again.
    client = undefined;
  });

  return client;
}

interface LspPosition {
  line: number;
  character: number;
}

interface LspDiagnostic {
  range: { start: LspPosition; end: LspPosition };
  severity?: 1 | 2 | 3 | 4;
  code?: number | string;
  source?: string;
  message: string;
}

interface DiagnosticReport {
  items?: LspDiagnostic[];
}

const SEVERITIES = { 1: 'error', 2: 'warning', 3: 'info', 4: 'hint' } as const;

/**
 * TypeScript 7 only pushes project-level diagnostics.
 * File diagnostics are pulled, which the CodeMirror client does not do on its own.
 */
function pullDiagnostics(): Extension {
  return linter(
    async (view): Promise<Diagnostic[]> => {
      const plugin = LSPPlugin.get(view);

      if (!plugin) return [];

      plugin.client.sync();

      const report = await plugin.client.request<
        { textDocument: { uri: string } },
        DiagnosticReport
      >('textDocument/diagnostic', { textDocument: { uri: plugin.uri } });

      return (report.items ?? []).map((item) => ({
        from: plugin.fromPosition(item.range.start),
        to: plugin.fromPosition(item.range.end),
        severity: SEVERITIES[item.severity ?? 1],
        source: item.source,
        message: `${item.message}${item.code ? ` (${item.code})` : ''}`,
      }));
    },
    { delay: 400 }
  );
}

/**
 * The editor extension that syncs the document to the language server
 * and shows its diagnostics, completions, and hovers.
 */
export async function typeScriptExtension(format: string, onStatus: OnStatus): Promise<Extension> {
  const language = LANGUAGES[format];

  if (!language) return [];

  const lsp = await typeScriptClient(onStatus);

  return [lsp.plugin(`${PROJECT_URI}/${language.file}`, language.languageId), pullDiagnostics()];
}
