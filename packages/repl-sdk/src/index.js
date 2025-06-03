/**
 * @typedef {import("./types.ts").Options} Options
 */
import { secret, secretKey } from './cache.js';
import { compilers } from './compilers.js';
import { resolvePath } from './resolve.js';
import { getFromTarball } from './tar.js';
import { assert, nextId, tgzPrefix } from './utils.js';

assert(`There is no document. repl-sdk is meant to be ran in a browser`, globalThis.document);

export const defaultFormats = Object.keys(compilers);

export const defaults = {
  formats: compilers,
};

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
      /**
       * Order of preference
       * 1. manually resolved (from the caller)
       * 2. specified in the compiler config (to use CDN)
       * 3. download tarball from npm
       *    or resolve from already downloaded tarball
       */
      resolve: (id, parentUrl, resolve) => {
        /**
         * We have to strip the query params because our manual resolving
         * doesn't use them -- but CDNs do
         */
        let vanilla = deCDN(id);

        this.#log('[resolve]', id, 'from', parentUrl);

        if (this.#options.resolve?.[vanilla]) {
          this.#log(`[resolve] ${vanilla} found in manually specified resolver`);

          return `manual:${vanilla}`;
        }

        for (let compilerResolve of this.#compilerResolvers) {
          let result = compilerResolve(vanilla);

          if (result) {
            this.#log(`[resolve] ${vanilla} found in compiler config at ${result}.`);

            return result;
          }
        }

        if (parentUrl.startsWith(tgzPrefix) && id.startsWith('.')) {
          let newId = resolvePath(parentUrl.replace(tgzPrefix, ''), id);
          // there has to be a better way to do this, yea?
          let url = new URL(tgzPrefix + newId);

          url.searchParams.set('from', parentUrl);
          url.searchParams.set('to', id);

          return url.href;
        }

        if (id.startsWith('https://')) return resolve(id, parentUrl);
        if (id.startsWith('blob:')) return resolve(id, parentUrl);
        if (id.startsWith('.')) return resolve(id, parentUrl);
        if (parentUrl.startsWith('https://')) return resolve(id, parentUrl);

        if (id.startsWith('node:')) {
          this.#log(`Is known node module: ${id}. Grabbing polyfill`);
          if (id === 'node:process') return `tgz://process`;
          if (id === 'node:buffer') return `tgz://buffer`;
          if (id === 'node:events') return `tgz://events`;
          if (id === 'node:path') return `tgz://path-browser`;
          if (id === 'node:util') return `tgz://util-browser`;
          if (id === 'node:crypto') return `tgz://crypto-browserify`;
          if (id === 'node:stream') return `tgz://stream-browserify`;
          if (id === 'node:fs') return `tgz://browserify-fs`;
        }

        this.#log(`[resolve] ${id} not found, deferring to npmjs.com's provided tarball`);

        return tgzPrefix + id;
      },
      // Hook source fetch function
      fetch: async (url, options) => {
        this.#log(`[fetch] attempting to fetch: ${url}`);

        if (this.#options.resolve) {
          if (url.startsWith('manual:')) {
            let name = url.replace(/^manual:/, '');

            this.#log('[fetch] resolved url in manually specified resolver', url);

            let result = await this.#resolveManually(name);

            let blobContent =
              `const mod = window[Symbol.for('${secretKey}')].resolves?.['${name}'];\n` +
              `\n\n` +
              `if (!mod) { throw new Error('Could not resolve \`${name}\`. Does the module exist? ( checked ${url} )') }` +
              `\n\n` +
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

        if (url.startsWith(tgzPrefix)) {
          this.#log('[fetch] resolved url via tgz resolver', url, options);

          let fullName = url.replace(tgzPrefix, '');

          let { code, ext } = await getFromTarball(fullName);

          /**
           * We don't know if this code is completely ready to run in the browser yet, so we might need to run in through the compiler again
           */
          let file = await this.#postProcess(code, ext);

          return new Response(new Blob([file], { type: 'application/javascript' }));
        }

        this.#log('[fetch] fetching url', url, options);

        const response = await fetch(url, options);

        if (!response.ok) return response;

        const source = await response.text();

        return new Response(new Blob([source], { type: 'application/javascript' }));
      },
    };
  }

  /**
   * NOTE: this does not resolve compilers that are not loaded yet.
   * So there would be a bit of a race condition here if different compilers
   * were to have incompatible post-processing handlers.
   *
   * @param {string} text
   * @param {string} ext
   */
  async #postProcess(text, ext) {
    let code = text;

    for (let compiler of this.#compilers) {
      if (compiler.handlers?.[ext]) {
        code = await compiler.handlers[ext](code);
      }
    }

    return code;
  }

  /**
   * @param {string} format
   * @param {string} text
   * @param {{ fileName?: string, flavor?: string }} [ options ]
   * @returns {}
   */
  async compile(format, text, options = {}) {
    this.#log('[compile] idempotently installing es-module-shim');
    await import('es-module-shims');

    let opts = { ...options };

    opts.fileName ||= `dynamic.${format}`;

    this.#log('[compile] compiling');

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
  #compilers = new Set();
  #compilerResolvers = new Set();

  /**
   * @param {string} format
   * @param {string | undefined} flavor
   */
  async #getCompiler(format, flavor) {
    const config = this.#resolveFormat(format, flavor);

    if (this.#compilerCache.has(config)) {
      return this.#compilerCache.get(config);
    }

    if (config.resolve) {
      this.#compilerResolvers.add(config.resolve);
    }

    const compiler = await config.compiler(this.optionsFor(format, flavor), this.#nestedPublicAPI);

    this.#compilerCache.set(config, compiler);
    this.#compilers.add(compiler);

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

  #resolveManually = async (name, fallback) => {
    const existing = window[Symbol.for(secretKey)].resolves?.[name];

    if (existing) {
      this.#log('[#resolveManually]', name, 'already resolved');

      return existing;
    }

    let result = await this.#options.resolve?.[name];

    if (!result) {
      this.#log(`[#resolveManually] Could not resolve ${name}`);
    }

    if (typeof result === 'function') {
      if (!result) {
        this.#log(`[#resolveManually] Value for ${name} is a function. Invoking.`);
      }

      result = await result();
    }

    /**
     * Compiler-implementation-provided fallback takes precidence over
     * going through the shimmedImport / tgz / npm fallback.
     */
    if (fallback) {
      result = await fallback();
    }

    window[secret].resolves ||= {};
    window[secret].resolves[name] ||= await result;

    return result;
  };

  #nestedPublicAPI = {
    tryResolve: async (name, fallback) => {
      const existing = await this.#resolveManually(name, fallback);

      if (existing) {
        this.#log(name, 'already resolved');

        return existing;
      }

      return shimmedImport(/* vite-ignore */ name);
    },
    tryResolveAll: async (names, fallback) => {
      let results = await Promise.all(
        names.map((name) => {
          return this.#nestedPublicAPI.tryResolve(name);
        })
      );

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

  #log(...args) {
    if (this.#options.logging) {
      console.debug(...args);
    }
  }
  #warn(...args) {
    if (this.#options.logging) {
      console.warn(...args);
    }
  }
  #error(...args) {
    if (this.#options.logging) {
      console.error(...args);
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
