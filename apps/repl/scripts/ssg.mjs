/**
 * Static Site Generation script for docs pages.
 *
 * Usage:
 *   1. Build client:  vite build
 *   2. Build SSR:     vite build --config vite.config.ssr.js
 *   3. Generate:      node scripts/ssg.mjs
 */

// Set up browser globals FIRST, before any other imports that might
// trigger module-scope browser API access in the SSR bundle.
import { Window } from 'happy-dom';

const _ssrWindow = new Window({ url: 'http://localhost' });

// Install browser globals that dependencies access at module scope.
// We must use Object.defineProperty to override read-only globals like `navigator`.
const globals = {
  // Core DOM
  window: _ssrWindow,
  document: _ssrWindow.document,
  self: _ssrWindow,
  navigator: _ssrWindow.navigator,
  location: _ssrWindow.location,
  history: _ssrWindow.history,

  // Storage
  localStorage: _ssrWindow.localStorage,
  sessionStorage: _ssrWindow.sessionStorage,

  // Timers
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  cancelAnimationFrame: clearTimeout,

  // DOM classes
  HTMLElement: _ssrWindow.HTMLElement,
  HTMLInputElement: _ssrWindow.HTMLInputElement,
  HTMLTextAreaElement: _ssrWindow.HTMLTextAreaElement,
  HTMLFormElement: _ssrWindow.HTMLFormElement,
  HTMLAnchorElement: _ssrWindow.HTMLAnchorElement,
  HTMLDivElement: _ssrWindow.HTMLDivElement,
  HTMLSpanElement: _ssrWindow.HTMLSpanElement,
  HTMLButtonElement: _ssrWindow.HTMLButtonElement,
  HTMLImageElement: _ssrWindow.HTMLImageElement,
  HTMLStyleElement: _ssrWindow.HTMLStyleElement,
  HTMLScriptElement: _ssrWindow.HTMLScriptElement,
  HTMLTemplateElement: _ssrWindow.HTMLTemplateElement,
  Element: _ssrWindow.Element,
  Node: _ssrWindow.Node,
  Text: _ssrWindow.Text,
  Comment: _ssrWindow.Comment,
  DocumentFragment: _ssrWindow.DocumentFragment,
  DOMParser: _ssrWindow.DOMParser,
  XMLSerializer: _ssrWindow.XMLSerializer,

  // Events
  Event: _ssrWindow.Event,
  CustomEvent: _ssrWindow.CustomEvent,
  InputEvent: _ssrWindow.InputEvent,
  KeyboardEvent: _ssrWindow.KeyboardEvent,
  MouseEvent: _ssrWindow.MouseEvent,
  FocusEvent: _ssrWindow.FocusEvent,
  PointerEvent: _ssrWindow.PointerEvent,
  TouchEvent: _ssrWindow.TouchEvent,
  ErrorEvent: _ssrWindow.ErrorEvent,

  // Observers
  MutationObserver: _ssrWindow.MutationObserver,
  IntersectionObserver: _ssrWindow.IntersectionObserver,
  ResizeObserver: _ssrWindow.ResizeObserver,

  // CSS
  CSSStyleSheet: _ssrWindow.CSSStyleSheet,
  CSSStyleDeclaration: _ssrWindow.CSSStyleDeclaration,
  MediaQueryList: _ssrWindow.MediaQueryList,
  getComputedStyle: _ssrWindow.getComputedStyle?.bind(_ssrWindow),

  // Other APIs
  Blob: _ssrWindow.Blob,
  File: _ssrWindow.File,
  FileReader: _ssrWindow.FileReader,
  FormData: _ssrWindow.FormData,
  DOMRect: _ssrWindow.DOMRect,
  Range: _ssrWindow.Range,
  Selection: _ssrWindow.Selection,
  SVGElement: _ssrWindow.SVGElement,
};

for (const [key, value] of Object.entries(globals)) {
  if (value === undefined) continue;

  try {
    Object.defineProperty(globalThis, key, {
      value,
      writable: true,
      configurable: true,
    });
  } catch {
    // ignore non-configurable globals
  }
}

// Now safe to import the rest
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { render } from 'vite-ember-ssr/server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const DOCS_ROUTES = [
  '/docs',
  '/docs/editor',
  '/docs/embedding',
  '/docs/ember-repl',
  '/docs/repl-sdk',
  '/docs/related',
];

async function main() {
  const clientDir = path.join(root, 'dist');
  const indexHtml = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf-8');

  // Import the SSR bundle
  const { createSsrApp } = await import(path.join(root, 'dist/server/app-ssr.js'));

  console.log(`Pre-rendering ${DOCS_ROUTES.length} docs routes...\n`);

  let succeeded = 0;
  let failed = 0;

  for (const route of DOCS_ROUTES) {
    try {
      const { html, error } = await render({
        url: route,
        template: indexHtml,
        createApp: createSsrApp,
      });

      if (error) {
        throw error;
      }

      // Write to the route's directory as index.html for clean URLs
      const outputDir = path.join(clientDir, route);

      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf-8');

      console.log(`  ✓ ${route}`);
      succeeded++;
    } catch (err) {
      console.error(`  ✗ ${route}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${succeeded} succeeded, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('SSG failed:', err);
  process.exit(1);
});
