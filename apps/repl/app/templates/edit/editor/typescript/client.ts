import { linter } from '@codemirror/lint';
import { languageServerExtensions, LSPClient, LSPPlugin } from '@codemirror/lsp-client';
import { EditorView, hoverTooltip } from '@codemirror/view';
import DOMPurify from 'dompurify';
import { installer } from 'repl-sdk/fs';

import { documentationRenderer } from './documentation.ts';

import type { Diagnostic } from '@codemirror/lint';
import type { Transport } from '@codemirror/lsp-client';
import type { Extension } from '@codemirror/state';
import type { Compiler } from 'repl-sdk';

/**
 * The packages the checker reads, at the versions the app itself has.
 * The vite plugin fills this in from node_modules.
 */
declare const __TS7_PACKAGES__: Record<string, string>;

/**
 * The project root is the REPL's file system, the same one the compiler
 * writes to and installs into.
 */
const ROOT_URI = 'file:///';

/**
 * The first request waits for the project to load, which reads every
 * declaration file the document reaches from the file system.
 */
const REQUEST_TIMEOUT = 30_000;

/**
 * Formats the type checker understands, and the LSP language id for each.
 * The file is the one the compiler writes for the format.
 */
const LANGUAGES: Record<string, { file: string; languageId: string } | undefined> = {
  gts: { file: 'src/index.gts', languageId: 'glimmer-ts' },
};

export function hasTypeScript(format: string): boolean {
  return Boolean(LANGUAGES[format]);
}

export type OnStatus = (message: string) => void;

/**
 * Where the loading is at, for the tooltip of a hover that comes too early.
 */
let status = 'Loading TypeScript';

/**
 * The last mouse position over the editor, for the hover that the language
 * server owes once it is ready.
 */
let lastMouse: { x: number; y: number } | undefined;

/**
 * Until the language server is ready, hovering says where the loading is at.
 * The tooltip goes away with the extension when the real one takes its place.
 */
export function loadingExtension(): Extension {
  return [
    hoverTooltip((_view, pos) => ({
      pos,
      above: true,
      create() {
        const dom = document.createElement('div');

        dom.className = 'cm-lsp-documentation cm-lsp-loading';
        dom.textContent = status;

        return { dom };
      },
    })),
    EditorView.domEventHandlers({
      mousemove(event) {
        lastMouse = { x: event.clientX, y: event.clientY };
      },
    }),
  ];
}

/**
 * Hovers again where the mouse last was, so the language server answers
 * the hover it was not there for.
 */
export function hoverAgain(view: EditorView): void {
  if (!lastMouse) return;

  const target = document.elementFromPoint(lastMouse.x, lastMouse.y);

  if (!target || !view.dom.contains(target)) return;

  target.dispatchEvent(
    new MouseEvent('mousemove', { bubbles: true, clientX: lastMouse.x, clientY: lastMouse.y })
  );
}

/**
 * The vite plugin writes TypeScript next to the app in parts.
 * The worker reads this manifest and joins them.
 */
function wasmUrl(): string {
  return `${import.meta.env.BASE_URL}ts7/tsc.wasm.json`;
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
          worker.postMessage({ type: 'start', wasmUrl: wasmUrl() });

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

/**
 * Puts the type declarations where the checker will look for them,
 * the same way a snippet's own imports get installed.
 */
async function installTypes(onStatus: OnStatus): Promise<void> {
  onStatus('Installing type declarations');

  await Promise.all(
    Object.entries(__TS7_PACKAGES__).map(([name, version]) => installer.ensure(name, version))
  );
}

let client: Promise<LSPClient> | undefined;
let worker: Worker | undefined;

/**
 * Forgets the language server, so the next document starts one afresh.
 * For tests, which share one page.
 */
export function stopTypeScript(): void {
  worker?.terminate();
  worker = undefined;
  client = undefined;
  status = 'Loading TypeScript';
  lastMouse = undefined;
}

/**
 * One language server per page. The first caller pays for the download.
 *
 * The compiler renders the documentation the server sends.
 * It is the page's one compiler too, so the first caller's is everyone's.
 */
export function typeScriptClient(compiler: Compiler, onStatus: OnStatus): Promise<LSPClient> {
  const report: OnStatus = (message) => {
    status = message;
    onStatus(message);
  };

  client ??= installTypes(report)
    .then(() => startWorker(report))
    .then(async ({ worker: started, transport }) => {
      worker = started;

      const lsp = new LSPClient({
        rootUri: ROOT_URI,
        extensions: languageServerExtensions(),
        timeout: REQUEST_TIMEOUT,
        renderMarkdown: documentationRenderer(compiler),
        /**
         * The documentation comes from the type declarations of packages,
         * and Markdown may carry HTML.
         */
        sanitizeHTML: (html) => DOMPurify.sanitize(html),
      }).connect(transport);

      await lsp.initializing;
      report('TypeScript ready');

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
export async function typeScriptExtension(
  format: string,
  compiler: Compiler,
  onStatus: OnStatus
): Promise<Extension> {
  const language = LANGUAGES[format];

  if (!language) return [];

  const lsp = await typeScriptClient(compiler, onStatus);

  return [lsp.plugin(`${ROOT_URI}${language.file}`, language.languageId), pullDiagnostics()];
}
