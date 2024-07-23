/**
 * @typedef {import("./types.ts").Options} Options
 */
import { assert } from './utils.js';

import { compilers } from './compilers.js';

assert(`There is no document. repl-sdk is meant to be ran in a browser`, globalThis.document);

export const defaultFormats = Object.keys(compilers);

export const defaults = {
  formats: compilers,
};

const secret = Symbol.for('__repl-sdk__compiler__');

assert(
  `There is already an instance of repl-sdk, and there can only be one. Make sure that your dependency graph is correct.`,
  !globalThis[secret]
);

export class Compiler {
  /** @type {Options} */
  #options;

  /**
   * Options may be passed to the compiler to add to its behavior.
   */
  constructor(options = defaults) {
    this.#options = options;

    globalThis[secret] = this;
    globalThis.window.esmsInitOptions = {
      shimMode: true,
      skip: `https://esm.sh/`,
      revokeBlobURLs: true, // default false
      // Permit overrides to import maps
      mapOverrides: true, // default false
      // Hook all module resolutions
      resolve: (id, parentUrl, resolve) => {
        if (id.startsWith('blob:')) return id;
        if (id.startsWith('https://')) return id;

        console.log('Resolving', id);
        /**
         * TODO: locally defined scope
         *       vs
         *       proxy to esm.sh
         */

        /**
         * For esm.sh, we want all imports to declare they don't want
         * their dependencies bundled. We want to have every import go
         * through this resolve/fetch combo of things so we have a chance
         * to compile if we need to.
         */
        return `https://esm.sh/*${id}`;
      },
      // Hook source fetch function
      fetch: async (url, options) => {
        console.log(`Fetching`, url);
        /**
         * Do transformations here based on file extension
         */
        if (url.endsWith('example.js')) {
          const transformed = `export const js = 'transformed'`;
          return new Response(new Blob([transformed], { type: 'application/javascript' }));
        }

        const response = await fetch(url, options);

        // if (response.url.endsWith('.ts')) {
        //   const source = await response.body();
        //   const transformed = tsCompile(source);
        //   return new Response(new Blob([transformed], { type: 'application/javascript' }));
        // }
        return response;
      },
    };
    // addShim();
  }

  /**
   * @param {string} format
   * @param {string} text
   * @param {{ fileName: string }} [ options ]
   * @returns {}
   */
  async compile(format, text, options = {}) {
    await import('es-module-shims');

    let opts = { ...options };

    opts.fileName ||= `dynamic.${format}`;

    const compiler = await this.#getCompiler(format);
    const compiled = await compiler.compile(text, opts.fileName);

    let compiledText = 'export default "failed to compile"';
    let extras = {};

    if (typeof compiled === 'string') {
      compiledText = compiled;
      extras = { compiled: compiledText };
    } else {
      let { compiled: text } = compiled;
      compiledText = text;
      extras = compiled;
    }

    const asBlobUrl = textToBlobUrl(compiledText);

    const { default: defaultExport } = await importShim(/* @vite-ignore */ asBlobUrl);

    return this.#render(compiler, defaultExport, extras);
  }

  async #getCompiler(format) {
    const config = this.#options.formats[format];

    assert(
      `${format} is not a configured format. ` +
        `The currently configured formats are ${Object.keys(this.#options.formats).join(', ')}`,
      config
    );

    const compiler = await config.compiler();

    return compiler;
  }

  async #render(compiler, whatToRender, extras) {
    const div = this.#createDiv();

    await compiler.render(div, whatToRender, extras);

    // Wait for render
    await new Promise((resolve) => requestIdleCallback(resolve));

    return div;
  }

  #createDiv() {
    let div = document.createElement('div');
    div.setAttribute('data-repl-output', '');
    div.id = 'some-random-string';
    return div;
  }
}

function addShim() {
  let url = 'https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js';

  if (document.querySelector('script[src="${url}"]')) {
    // Shim is already present
    return;
  }

  let script = document.createElement('script');
  // script.setAttribute('async', '');
  script.setAttribute('src', `<script async src="${url}"></script>`);

  document.head.appendChild(script);
}

/**
 * @param {string} text
 */
function textToBlobUrl(text) {
  const blob = new Blob([text], { type: 'text/javascript' });

  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}
