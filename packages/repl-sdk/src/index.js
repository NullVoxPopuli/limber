/**
 * @typedef {import("./types.ts").Options} Options
 */
import { compilers } from './compilers.js';
import { assert, nextId } from './utils.js';

assert(`There is no document. repl-sdk is meant to be ran in a browser`, globalThis.document);

export const defaultFormats = Object.keys(compilers);

export const defaults = {
  formats: compilers,
};

const secretKey = '__repl-sdk__compiler__';
const secret = Symbol.for(secretKey);

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
    this.#options = Object.assign({}, defaults, options);

    globalThis[secret] = this;
    globalThis.window.esmsInitOptions = {
      shimMode: true,
      skip: `https://esm.sh/`,
      revokeBlobURLs: true, // default false
      // Permit overrides to import maps
      mapOverrides: true, // default false
      // Hook all module resolutions
      resolve: (id /*, parentUrl, resolve */) => {
        /**
         * We have to strip the query params because our manual resolving
         * doesn't use them -- but CDNs do
         */
        let vanilla = deCDN(id);
        this.#log('[resolve]', id, 'potentially manually via', vanilla);

        if (id.startsWith('blob:')) return id;
        if (id.startsWith('https://')) return id;
        if (id.startsWith('.')) return id;

        if (this.#options.resolve?.[vanilla]) {
          this.#log(`[resolve] ${vanilla} found in manually specified resolver`);

          return `manual:${vanilla}`;
        }

        this.#log(`[resolve] ${id} not found, deferring to esm.sh`);

        if (id.startsWith('node:')) {
          this.#log(`Is known node module: ${id}. Grabbing polyfill`);
          if (id === 'node:process') return `esm.sh:process`;
          if (id === 'node:buffer') return `esm.sh:buffer`;
          if (id === 'node:events') return `esm.sh:events`;
          if (id === 'node:path') return `esm.sh:path-browser`;
          if (id === 'node:util') return `esm.sh:util-browser`;
          if (id === 'node:crypto') return `esm.sh:crypto-browserify`;
          if (id === 'node:stream') return `esm.sh:stream-browserify`;
          if (id === 'node:fs') return `esm.sh:browserify-fs`;
        }

        return `esm.sh:${id}`;
      },
      // Hook source fetch function
      fetch: async (url, options) => {
        this.#log(`[fetch] attempting to fetch: ${url}`);

        if (this.#options.resolve) {
          if (url.startsWith('manual:')) {
            let name = url.replace(/^manual:/, '');

            this.#log('[fetch] resolved url in manually specified resolver', url);

            let result = this.#options.resolve[name];

            if (!result) {
              this.#error(`[fetch] Could not resolve ${url}`);
            }

            if (typeof result === 'function') {
              if (!result) {
                this.#error(`[fetch] Value for ${url} is a function. Invoking.`);
              }

              result = await result();
            }

            window[secret].resolves ||= {};
            window[secret].resolves[name] ||= await result;

            let blobContent =
              `const mod = window[Symbol.for('${secretKey}')].resolves?.['${name}'];\n` +
              /**
               * This is semi-trying to polyfill modules
               * that aren't proper ESM. very annoying.
               */
              `${Object.keys(result)
                .map((exportName) => {
                  if (exportName === 'default') {
                    return `export default mod.default ?? mod;`;
                  }

                  return `export const ${exportName} = mod.${exportName};`;
                })
                .join('\n')}
            `;

            let blob = new Blob(Array.from(blobContent), { type: 'application/javascript' });

            this.#log(
              `[fetch] returning blob mapping to manually resolved import for ${name}`
              // blobContent
            );

            return new Response(blob);
          }
        }

        this.#log('[fetch] fetching url', url, options);

        if (url.startsWith('esm.sh:')) {
          let name = url.replace(/^esm\.sh:/, '');
          // Where is this double // coming from?
          let newUrl = `https://esm.sh/*${name}`.replaceAll('//', '/').replaceAll('/*/*', '/*');

          const response = await fetch(newUrl, options);

          if (!response.ok) return response;

          const source = await response.text();

          // console.log({ source, url, newUrl });

          return new Response(new Blob([source], { type: 'application/javascript' }));
        }

        const response = await fetch(url, options);

        if (!response.ok) return response;

        const source = await response.text();

        // const transformed = tsCompile(source);
        //
        // console.log({ source, url });

        return new Response(new Blob([source], { type: 'application/javascript' }));
      },

      // onimport: async (url, options, parentUrl) => {
      //   console.log('[onimport]', url, options, parentUrl);
      // },
    };
    // addShim();
  }

  /**
   * @param {string} format
   * @param {string} text
   * @param {{ fileName?: string, flavor?: string }} [ options ]
   * @returns {}
   */
  async compile(format, text, options = {}) {
    await import('es-module-shims');

    let opts = { ...options };

    opts.fileName ||= `dynamic.${format}`;

    const compiler = await this.#getCompiler(format, opts.flavor);
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

    const { default: defaultExport } = await shimmedImport(/* @vite-ignore */ asBlobUrl);

    return this.#render(compiler, defaultExport, extras);
  }

  #compilerCache = new WeakMap();
  /**
   * @param {string} format
   * @param {string | undefined} flavor
   */
  async #getCompiler(format, flavor) {
    const config = this.#resolveFormat(format, flavor);

    if (this.#compilerCache.has(config)) {
      return this.#compilerCache.get(config);
    }

    const compiler = await config.compiler(this.optionsFor(format, flavor), this.#nestedPublicAPI);

    this.#compilerCache.set(config, compiler);

    return compiler;
  }

  /**
   * @param {string} format
   * @param {string | undefined} flavor
   */
  #resolveFormat(format, flavor) {
    let config = this.#options.formats[format];

    assert(
      `${format} is not a configured format / extension. ` +
        `The currently configured formats are ${Object.keys(this.#options.formats).join(', ')}`,
      config
    );

    if (flavor && flavor in config) {
      config = config[flavor];
    }

    assert(
      `The config for ${format}${flavor ? ` (using flavor ${flavor})` : ''} is missing the 'compiler' function. It had keys: ${Object.keys(config)}. If this is a language with multiple flavors, make sure you specify the flavor.`,
      'compiler' in config
    );

    return config;
  }

  async #render(compiler, whatToRender, extras) {
    const div = this.#createDiv();

    await compiler.render(div, whatToRender, extras, this.#nestedPublicAPI);

    // Wait for render
    await new Promise((resolve) => requestIdleCallback(resolve));

    return div;
  }

  /**
   * @param {string} format
   * @param {string} [ flavor ]
   * @returns {import('./types.ts').ResolvedCompilerOptions)}
   */
  optionsFor = (format, flavor) => {
    const { needsLiveMeta } = this.#resolveFormat(format, flavor);

    return {
      needsLiveMeta: needsLiveMeta ?? true,
      importMap: this.#options.importMap ?? {},
      resolve: this.#options.resolve ?? {},
      versions: this.#options.versions ?? {},
    };
  };

  #nestedPublicAPI = {
    tryResolve: async (name) => {
      const existing = await window[Symbol.for(secretKey)].resolves?.[name];

      if (existing) {
        this.#log(name, 'already resolved');

        return existing;
      }

      return shimmedImport(/* vite-ignore */ name);
    },
    tryResolveAll: async (names, fallback) => {
      let results = await Promise.all(names.map(this.#nestedPublicAPI.tryResolve));

      if (fallback) {
        let morePromises = {};

        for (let i = 0; i < results.length; i++) {
          let result = results[i];
          let name = names[i];

          if (!result) {
            this.#warn(`Could not load ${name}. Trying fallback.`);

            morePromises[i] = fallback(name);
          }
        }

        await Promise.all(Object.values(morePromises));

        for (let i = 0; i < results.length; i++) {
          let result = results[i];

          if (!result && morePromises[i]) {
            result = morePromises[i];
          }
        }
      }

      return results;
    },
    compile: (...args) => this.compile(...args),
    optionsFor: (...args) => this.optionsFor(...args),
  };

  #createDiv() {
    let div = document.createElement('div');

    div.setAttribute('data-repl-output', '');
    div.id = nextId();

    return div;
  }

  #log(msg) {
    if (this.#options.logging) {
      console.debug(msg);
    }
  }
  #warn(msg) {
    if (this.#options.logging) {
      console.warn(msg);
    }
  }
  #error(msg) {
    if (this.#options.logging) {
      console.error(msg);
    }
  }
}

/**
 * @param {string} text
 */
function textToBlobUrl(text) {
  const blob = new Blob([text], { type: 'text/javascript' });

  const blobUrl = URL.createObjectURL(blob);

  return blobUrl;
}

/**
 * This should have happened at the beginning of the compile function.
 * If this error is ever thrown, something goofy has happened, and it would be very unexpected.
 */
function shimmedImport(...args) {
  if (!globalThis.importShim) {
    throw new Error(`Could not find importShim. Has the REPL been set up correctly?`);
  }

  return globalThis.importShim(/* @vite-ignore */ ...args);
}

/**
 * CDNs will pre-process every file to make sure every import goes through them.
 * We don't want this.
 */
function deCDN(id) {
  let noQPs = id.split('?')[0];

  return noQPs;
}
