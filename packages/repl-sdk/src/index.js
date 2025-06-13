/**
 * @typedef {import("./types.ts").Options} Options
 * @typedef {import('./types.ts').CompilerConfig} CompilerConfig
 */

import mime from 'mime/lite';

import { cache, secretKey } from './cache.js';
import { compilers } from './compilers.js';
import { STABLE_REFERENCE } from './es-module-shim.js';
import { getTarRequestId } from './request.js';
import { getFromTarball } from './tar.js';
import { assert, nextId, prefix_tgz, tgzPrefix, unzippedPrefix } from './utils.js';

assert(`There is no document. repl-sdk is meant to be ran in a browser`, globalThis.document);

export const defaultFormats = Object.keys(compilers);

export const defaults = {
  formats: compilers,
};

export class Compiler {
  /** @type {Options} */
  #options;

  /**
   * Options may be passed to the compiler to add to its behavior.
   * @param {Partial<Options>} options
   */
  constructor(options = defaults) {
    this.#options = Object.assign({}, defaults, options);

    STABLE_REFERENCE.resolve = this.#resolve;
    STABLE_REFERENCE.fetch = this.#fetch;
  }

  /**
   * Order of preference
   * 1. manually resolved (from the caller)
   * 2. specified in the compiler config (to use CDN)
   * 3. download tarball from npm
   *    or resolve from already downloaded tarball
   *
   * NOTE: when we return a new URL, we want to collapse the parentURI
   *       so that we don't get compound query params in nested requests.
   *
   * @param {string} id
   * @param {string} parentUrl
   * @param {(id: string, parentUrl: string) => string} resolve
   * @returns {string}
   */
  #resolve = (id, parentUrl, resolve) => {
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

    if (parentUrl.startsWith(tgzPrefix) && (id.startsWith('.') || id.startsWith('#'))) {
      let answer = getTarRequestId({ to: id, from: parentUrl });

      return answer;
    }

    if (id.startsWith('https://')) return resolve(id, parentUrl);
    if (id.startsWith('blob:')) return resolve(id, parentUrl);
    if (id.startsWith('.')) return resolve(id, parentUrl);
    if (parentUrl.startsWith('https://') && parentUrl !== location.href)
      return resolve(id, parentUrl);
    if (parentUrl.startsWith('https://') && parentUrl.startsWith('/'))
      return resolve(id, parentUrl);

    if (id.startsWith('node:')) {
      this.#log(`Is known node module: ${id}. Grabbing polyfill`);

      if (id === 'node:process') return prefix_tgz(`process`);
      if (id === 'node:buffer') return prefix_tgz(`buffer`);
      if (id === 'node:events') return prefix_tgz(`events`);
      if (id === 'node:path') return prefix_tgz(`path-browser`);
      if (id === 'node:util') return prefix_tgz(`util-browser`);
      if (id === 'node:crypto') return prefix_tgz(`crypto-browserify`);
      if (id === 'node:stream') return prefix_tgz(`stream-browserify`);
      if (id === 'node:fs') return prefix_tgz(`browserify-fs`);
    }

    this.#log(`[resolve] ${id} not found, deferring to npmjs.com's provided tarball`);

    return getTarRequestId({ to: id, from: parentUrl });
  };
  /**
   * @param {string} url
   * @param {RequestInit} options
   * @returns {Promise<Response>}
   */
  #fetch = async (url, options) => {
    let mimeType = mime.getType(url) ?? 'application/javascript';

    this.#log(`[fetch] attempting to fetch: ${url}. Assuming ${mimeType}`);

    if (url.startsWith('manual:')) {
      let name = url.replace(/^manual:/, '');

      this.#log('[fetch] resolved url in manually specified resolver', url);

      let result = await this.#resolveManually(name);

      assert(`Failed to resolve ${name}`, result);

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

      let blob = new Blob(Array.from(blobContent), { type: mimeType });

      this.#log(
        `[fetch] returning blob mapping to manually resolved import for ${name}`
        // blobContent
      );

      return new Response(blob);
    }

    if (url.startsWith(unzippedPrefix)) {
      this.#log('[fetch] resolved url via tgz resolver', url, options);

      let tarInfo = await getFromTarball(url);

      assert(`Could not find file for ${url}`, tarInfo);

      let { code, ext } = tarInfo;

      /**
       * We don't know if this code is completely ready to run in the browser yet, so we might need to run in through the compiler again
       */
      let file = await this.#postProcess(code, ext);

      return new Response(new Blob([file], { type: 'application/javascript' }));
    }

    if (url.startsWith('https://')) {
      return fetch(url, options);
    }

    this.#log('[fetch] fetching url', url, options);

    const response = await fetch(url, options);

    if (!response.ok) return response;

    const source = await response.text();

    return new Response(new Blob([source], { type: 'application/javascript' }));
  };

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
   * @param {{ fileName?: string, flavor?: string, [key: string]: unknown }} [ options ]
   * @returns {Promise<HTMLElement>}
   */
  async compile(format, text, options = {}) {
    this.#log('[compile] idempotently installing es-module-shim');

    // @ts-ignore
    await import('es-module-shims');

    let opts = { ...options };

    opts.fileName ||= `dynamic.${format}`;

    this.#log('[compile] compiling');

    const compiler = await this.#getCompiler(format, opts.flavor);
    const compiled = await compiler.compile(text, opts);

    let compiledText = 'export default "failed to compile"';
    let extras = { compiled: '' };

    if (typeof compiled === 'string') {
      compiledText = compiled;
      extras = { compiled: compiledText };
    } else {
      let { compiled: text } = compiled;

      compiledText = text;
      extras = compiled;
    }

    const asBlobUrl = textToBlobUrl(compiledText);

    // @ts-ignore
    const { default: defaultExport } = await shimmedImport(/* @vite-ignore */ asBlobUrl);

    this.#log('[compile] preparing to render', defaultExport, extras);

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

    const options = this.optionsFor(format, flavor);
    const compiler = await config.compiler(options, this.#nestedPublicAPI);

    this.#compilerCache.set(config, compiler);
    this.#compilers.add(compiler);

    return compiler;
  }

  /**
   * @param {string} format
   * @param {string | undefined} flavor
   * @returns {import('./types').CompilerConfig}
   */
  #resolveFormat(format, flavor) {
    let config = this.#options.formats[format];

    assert(
      `${format} is not a configured format / extension. ` +
        `The currently configured formats are ${Object.keys(this.#options.formats).join(', ')}`,
      config
    );

    if (flavor && flavor in config) {
      config = /** @type {{ [flavor: string]: CompilerConfig}} */ (config)[flavor];
    }

    assert(
      `The config for ${format}${flavor ? ` (using flavor ${flavor})` : ''} is missing the 'compiler' function. It had keys: ${Object.keys(/** @type {any} */ (config))}. If this is a language with multiple flavors, make sure you specify the flavor.`,
      'compiler' in /** @type {any} */ (config)
    );

    return /** @type {import('./types').CompilerConfig} */ (config);
  }

  /**
   * @param {string} format
   * @param {string | undefined} flavor
   * @returns {{ [key: string]: unknown }}
   */
  #resolveUserOptions(format, flavor) {
    let config = /** @type {{ [key: string]: unknown }} */ (this.#options.options?.[format]);

    if (!config) return {};

    if (flavor && flavor in config) {
      config = /** @type {{ [key: string]: unknown }} */ (config[flavor]);
    }

    return config ?? {};
  }

  /**
   * @param {import('./types.ts').Compiler} compiler
   * @param {string} whatToRender
   * @param {{ compiled: string } & Record<string, unknown>} extras
   * @returns {Promise<HTMLElement>}
   */
  async #render(compiler, whatToRender, extras) {
    const div = this.#createDiv();

    await compiler.render(div, whatToRender, extras, this.#nestedPublicAPI);

    // Wait for render
    await new Promise((resolve) => requestAnimationFrame(resolve));

    return div;
  }

  /**
   * @param {string} format
   * @param {string | undefined} flavor
   */
  optionsFor = (format, flavor) => {
    const { needsLiveMeta } = this.#resolveFormat(format, flavor);

    return {
      needsLiveMeta: /* @type {boolean | undefined} */ needsLiveMeta ?? true,
      versions: this.#options.versions ?? {},
      ...(this.#resolveUserOptions(format, flavor) ?? {}),
    };
  };

  static clearCache() {
    cache.clear();
  }

  /**
   * @param {string} name
   * @param {(name?: string) => Promise<undefined | object>} [fallback]
   * @returns {Promise<undefined | object>}
   */
  #resolveManually = async (name, fallback) => {
    const existing = cache.resolves[name];

    if (existing) {
      this.#log('[#resolveManually]', name, 'already resolved');

      return existing;
    }

    let result =
      /** @type {object | undefined} */
      (await this.#options.resolve?.[name]);

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
      result = await fallback(name);
    }

    cache.resolves[name] ||= await result;

    return result;
  };

  /**
   * @type {import('./types.ts').PublicMethods}
   */
  #nestedPublicAPI = {
    /**
     * @param {string} name
     * @param {(name?: string) => Promise<object | undefined>} [fallback]
     * @returns {Promise<object | undefined>}
     */
    tryResolve: async (name, fallback) => {
      const existing = await this.#resolveManually(name, fallback);

      if (existing) {
        this.#log(name, 'already resolved');

        return existing;
      }

      // @ts-ignore
      let shimmed = await shimmedImport(/* vite-ignore */ name);

      return shimmed;
    },
    /**
     * @param {string[]} names
     * @param {(name?: string) => Promise<unknown>} [fallback]
     * @returns {Promise<unknown[]>}
     */
    tryResolveAll: async (names, fallback) => {
      let results = await Promise.all(
        names.map((name) => {
          return this.#nestedPublicAPI.tryResolve(name);
        })
      );

      if (fallback) {
        /** @type {Record<string, Promise<unknown>>} */
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
    /**
     * @param {Parameters<Compiler['compile']>} args
     */
    compile: (...args) => this.compile(...args),
    /**
     * @param {Parameters<Compiler['optionsFor']>} args
     */
    optionsFor: (...args) => this.optionsFor(...args),

    canCompile: (format, flavor) => {
      let config = this.#options.formats[format];

      if (!config) {
        return {
          result: false,
          reason:
            `${format} is not a configured format / extension. ` +
            `The currently configured formats are ${Object.keys(this.#options.formats).join(', ')}`,
        };
      }

      if (flavor && flavor in config) {
        config = /** @type {{ [flavor: string]: CompilerConfig}} */ (config)[flavor];
      }

      if (!config) {
        return {
          result: false,
          reason:
            `${format} for ${flavor} is not a configured format / extension. ` +
            `The currently configured formats are ${Object.keys(this.#options.formats).join(', ')}`,
        };
      }

      if ('compiler' in config) {
        return { result: true };
      }

      return {
        result: false,
        reason: `The config for ${format}${flavor ? ` (using flavor ${flavor})` : ''} is missing the 'compiler' function. It had keys: ${Object.keys(config)}. If this is a language with multiple flavors, make sure you specify the flavor.`,
      };
    },

    getCompiler: (format, flavor) => this.#getCompiler(format, flavor),

    getAllowedFormats: () => Object.keys(this.#options.formats),

    getFlavorsFor: (format) => {
      let config = this.#options.formats[format];

      if (!config) return [];
      if (typeof config === 'function') return [];

      if (typeof config === 'object') {
        return Object.keys(config);
      }

      return [];
    },
  };

  #createDiv() {
    let div = document.createElement('div');

    div.setAttribute('data-repl-output', '');
    div.id = nextId();

    return div;
  }

  /**
   * @param {Parameters<typeof console.debug>} args
   */
  #log(...args) {
    if (this.#options.logging) {
      console.debug(...args);
    }
  }
  /**
   * @param {Parameters<typeof console.warn>} args
   */
  #warn(...args) {
    if (this.#options.logging) {
      console.warn(...args);
    }
  }

  /**
   * @param {Parameters<typeof console.error>} args
   */
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

 * @param {...any[]} args
 */
function shimmedImport(...args) {
  if (!globalThis.importShim) {
    throw new Error(`Could not find importShim. Has the REPL been set up correctly?`);
  }

  // @ts-ignore
  return globalThis.importShim(/* @vite-ignore */ ...args);
}

/**
 * CDNs will pre-process every file to make sure every import goes through them.
 * We don't want this.
 *
 * @param {string} id
 * @returns {string}
 */
function deCDN(id) {
  let noQPs = id.split('?')[0];

  return /** @type {string} */ (noQPs);
}
