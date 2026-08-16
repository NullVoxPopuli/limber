/**
 * @typedef {import("./types.ts").Options} Options
 * @typedef {import('./types.ts').CompilerConfig} CompilerConfig
 */

import { cache, secretKey } from './cache.js';
import { compilers } from './compilers.js';
import { STABLE_REFERENCE } from './es-module-shim.js';
import { PROJECT_PREFIX, releaseEntry, writeEntry } from './fs/entry.js';
import { clearFs, installer, vfs } from './fs/store.js';
import { NPM_PREFIX, parseVirtualUrl, specifierUrl, typeFor, virtualUrl } from './fs/url.js';
import { virtualModuleSource } from './fs/virtual.js';
import { assert, errorMessage, nextId } from './utils.js';

/**
 * node builtins that have a browser-shaped package on npm.
 */
const NODE_POLYFILLS = {
  'node:buffer': 'buffer',
  'node:crypto': 'crypto-browserify',
  'node:events': 'events',
  'node:fs': 'browserify-fs',
  'node:path': 'path-browser',
  'node:process': 'process',
  'node:stream': 'stream-browserify',
  'node:util': 'util-browser',
};

assert(`There is no document. repl-sdk is meant to be ran in a browser`, globalThis.document);

export { errorMessage } from './utils.js';

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
    STABLE_REFERENCE.source = this.#source;

    window.addEventListener('unhandledrejection', this.#handleUnhandledRejection);
  }

  /**
   * Every file downloaded so far, keyed by URL, plus an import map of where
   * each installed specifier landed. Resolution reads neither; they are here
   * so a REPL can show what a demo actually ran against.
   */
  get fs() {
    return { files: vfs, imports: installer.imports };
  }

  /**
   *
   * @param {HTMLElement} element
   * @param {any} options
   */
  async createEditor(element, { text, format, handleUpdate, extensions }) {
    // Only one instance is allowed
    return cache.cachedPromise('codemirror', async () => {
      const { buildCodemirror } = await import('./codemirror.js');

      return buildCodemirror({
        element,
        text,
        format,
        extensions,
        handleUpdate,
        getLang: async (format) => {
          const [lang, flavor] = format.split('|');

          assert(`Could not determine 'lang' from format: ${format}`, lang);

          const compiler = this.#resolveFormat(lang, flavor);
          const loadLang = compiler.codemirror?.lang;

          assert(
            `The compiler for '${format}' is missing its configuration for 'codemirror.lang'`,
            loadLang
          );

          return await loadLang();
        },
        getSupport: async (format) => {
          const [lang, flavor] = format.split('|');

          assert(`Could not determine 'lang' from format: ${format}`, lang);

          const compiler = this.#resolveFormat(lang, flavor);
          const loadSupport = compiler.codemirror.support;

          return await loadSupport?.();
        },
      });
    });
  }

  /**
   * @param {PromiseRejectionEvent} e
   */
  #handleUnhandledRejection = (e) => {
    let handled = false;

    for (const onUnhandled of this.#compilerOnUnhandled) {
      onUnhandled(e, (message) => {
        this.#announce('error', message);
        handled = true;
      });
      if (handled) break;
    }

    if (handled) return;

    this.#announce('error', errorMessage(e.reason));
  };

  /**
   * Synchronous, and it stays synchronous by never trying to know anything it
   * would have to download to find out. A bare specifier becomes a URL that
   * names the package; the source hook turns that into the URL of a real file.
   *
   * Order of preference
   * 1. manually resolved (from the caller)
   * 2. specified in the compiler config (to use CDN)
   * 3. npm
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
    const vanilla = deCDN(id);

    this.#announce('info', `Loading ${vanilla}`);
    this.#log('[resolve]', id, 'from', parentUrl);

    if (this.#options.resolve?.[vanilla]) {
      this.#log(`[resolve] ${vanilla} found in manually specified resolver`);

      return virtualUrl('manual', vanilla);
    }

    for (const compilerResolve of this.#compilerResolvers) {
      const result = compilerResolve(vanilla);

      if (result) {
        this.#log(`[resolve] ${vanilla} found in compiler config at ${result}.`);

        if (typeof result === 'function') {
          return virtualUrl('configured', vanilla);
        }

        return result;
      }
    }

    /**
     * Subpath imports are private to the package that declares them, so the
     * package has to travel with the specifier. `#` starts a URL fragment,
     * hence the encoding.
     */
    if (id.startsWith('#') && parentUrl.startsWith(NPM_PREFIX)) {
      const pkg = parentUrl.slice(NPM_PREFIX.length).split('/')[0];

      return `${NPM_PREFIX}${pkg}/${encodeURIComponent(id)}`;
    }

    /**
     * The parent URL already says where it lives, so this is URL math and the
     * default resolver can do it. This is the case that used to need a request
     * id and a `?from=` parent chain.
     */
    if (id.startsWith('.') || id.startsWith('/')) return resolve(id, parentUrl);
    if (id.startsWith('https://') || id.startsWith('blob:')) return resolve(id, parentUrl);
    if (id.startsWith('file:')) return resolve(id, parentUrl);

    if (parentUrl.startsWith('https://') && parentUrl !== location.href) {
      return resolve(id, parentUrl);
    }

    const polyfill = NODE_POLYFILLS[/** @type {keyof typeof NODE_POLYFILLS} */ (id)];

    if (polyfill) {
      this.#log(`Is known node module: ${id}. Grabbing polyfill`);

      return specifierUrl(polyfill);
    }

    this.#log(`[resolve] ${id} not found, deferring to npmjs.com's provided tarball`);

    return specifierUrl(vanilla);
  };
  /**
   * The es-module-shims source hook, which supersedes the fetch hook
   * (es-module-shims marks `fetch` deprecated in favor of this one).
   *
   * This is where the async work lives. `resolve` handed us a URL that only
   * names a package; this installs it, and returns the URL of the file that
   * actually holds the code. es-module-shims uses the returned URL as the base
   * for that module's own relative imports, which is what lets the whole
   * request-id and parent-chain layer go away.
   *
   * @param {string} url
   * @param {RequestInit} fetchOpts
   * @param {string} parent
   * @param {(url: string, fetchOpts: RequestInit, parent: string) => Promise<any>} defaultSourceHook
   */
  #source = async (url, fetchOpts, parent, defaultSourceHook) => {
    /**
     * Hot reloading appends ?v={n}. The registry keeps it, the fs doesn't.
     */
    const path = url.replace(/\?v=\d+$/, '');
    const virtual = parseVirtualUrl(path);

    if (virtual) {
      this.#log('[source] virtual module', path);

      const source = await this.#virtualModuleSource(virtual.kind, virtual.name);

      this.#announce('info', `Loaded ${virtual.name}`);

      return { url, type: 'js', source };
    }

    if (path.startsWith(PROJECT_PREFIX)) {
      const file = vfs.read(path);

      assert(`${path} is not in the fs`, file);

      this.#log('[source] project', path);

      return { url, type: file.type, source: file.source };
    }

    if (path.startsWith(NPM_PREFIX)) {
      this.#log('[source] npm', path);

      const real = await installer.resolveUrl(path);

      assert(`Could not resolve ${path}`, real);

      const file = vfs.read(real);

      assert(`${real} resolved but is not in the fs`, file);

      const source = await this.#postProcess(file.source, extensionOf(real));

      this.#announce('info', `Loaded ${real}`);

      return { url: real, type: typeFor(real), source };
    }

    this.#log('[source] passing through', path);

    return defaultSourceHook(url, fetchOpts, parent);
  };

  /**
   * Both kinds of virtual module are a live JS object that has to be handed to
   * the module system as source.
   *
   * @param {string} kind
   * @param {string} name
   * @returns {Promise<string>}
   */
  async #virtualModuleSource(kind, name) {
    if (kind === 'manual') {
      const result = await this.#resolveManually(name);

      assert(`Failed to resolve ${name}`, result);

      return virtualModuleSource(name, result, secretKey);
    }

    /**
     * Unlike the manual resolver, these are just functions per id, they
     * represent a way to get a module.
     */
    let result;

    for (const compilerResolve of this.#compilerResolvers) {
      const fn = compilerResolve(name);

      if (fn) {
        result = await fn();
      }
    }

    assert(`Failed to resolve ${name}`, result);
    cache.resolves[name] = result;

    return virtualModuleSource(name, result, secretKey);
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

    for (const compiler of this.#compilers) {
      if (compiler.handlers?.[ext]) {
        code = await compiler.handlers[ext](code);
      }
    }

    return code;
  }

  /**
   * @param {string} format
   * @param {string} text
   * @param {{ fileName?: string, flavor?: string, args?: Record<string, unknown>, [key: string]: unknown }} [ options ]
   * @returns {Promise<{ element: HTMLElement, destroy: () => void }>}
   */
  async compile(format, text, options = {}) {
    this.#announce('info', `Compiling ${format}`);

    try {
      return await this.#compile(format, text, options);
    } catch (e) {
      // for on.log usage
      this.#announce('error', errorMessage(e));

      // Don't hide errors!
      this.#error(e);
      throw e;
    }
  }

  /**
   * @param {string} format
   * @param {string} text
   * @param {{ fileName?: string, flavor?: string, [key: string]: unknown }} [ options ]
   * @returns {Promise<{ element: HTMLElement, destroy: () => void }>}
   */
  async #compile(format, text, options) {
    this.#log('[compile] idempotently installing es-module-shim');

    // @ts-ignore
    await import('es-module-shims');

    const opts = { ...options };

    opts.fileName ||= `dynamic.${format}`;

    this.#log('[compile] compiling');

    const compiler = await this.#getCompiler(format, opts.flavor);
    const compiled = await compiler.compile(text, opts);

    let compiledText = 'export default "failed to compile"';
    let extras = { compiled: '' };

    if (typeof compiled === 'string') {
      compiledText = compiled;
      extras = { compiled: compiledText };
    } else if (typeof compiled.compiled === 'string') {
      const { compiled: text } = compiled;

      compiledText = text;
      extras = compiled;
    } else {
      /**
       * the compiler didn't return text, so we can skip import shimming
       */
      let value = compiled;

      if ('compiled' in compiled) {
        value = compiled.compiled;
        extras = compiled;
      }

      return this.#render(compiler, value, {
        ...extras,
        compiled: value,
        ...(opts.args ? { args: opts.args } : {}),
      });
    }

    const entryUrl = writeEntry(vfs, opts.fileName, compiledText);

    let defaultExport;

    try {
      // @ts-ignore
      ({ default: defaultExport } = await shimmedImport(/* @vite-ignore */ entryUrl));
    } finally {
      releaseEntry(vfs, entryUrl);
    }

    this.#log('[compile] preparing to render', defaultExport, extras);

    return this.#render(compiler, defaultExport, {
      ...extras,
      ...(opts.args ? { args: opts.args } : {}),
    });
  }

  #compilerCache = new WeakMap();
  #compilers = new Set();
  #compilerResolvers = new Set();
  /**
   * @type {Set<(e: PromiseRejectionEvent, handle: (message: string) => void) => void>}
   */
  #compilerOnUnhandled = new Set();

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

    if (config.onUnhandled) {
      this.#compilerOnUnhandled.add(config.onUnhandled);
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
   * @returns {Promise<{ element: HTMLElement, destroy: () => void }>}
   */
  async #render(compiler, whatToRender, extras) {
    this.#announce('info', 'Rendering');

    const div = this.#createDiv();

    assert(`Cannot render falsey values. Did compilation succeed?`, whatToRender);

    const destroy = await compiler.render(div, whatToRender, extras, this.#nestedPublicAPI);

    // Wait for render
    await new Promise((resolve) => requestAnimationFrame(resolve));

    return {
      element: div,
      destroy: () => {
        if (destroy) {
          return destroy();
        }
      },
    };
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
    clearFs();
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
     * @param {'error' | 'info'} type
     * @param {string} message
     * @returns {void}
     */
    announce: (type, message) => this.#announce(type, message),

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
      const shimmed = await shimmedImport(/* vite-ignore */ name);

      return shimmed;
    },
    /**
     * @param {string[]} names
     * @param {(name?: string) => Promise<unknown>} [fallback]
     * @returns {Promise<unknown[]>}
     */
    tryResolveAll: async (names, fallback) => {
      const results = await Promise.all(
        names.map((name) => {
          return this.#nestedPublicAPI.tryResolve(name);
        })
      );

      if (fallback) {
        /** @type {Record<string, Promise<unknown>>} */
        const morePromises = {};

        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const name = names[i];

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
      const config = this.#options.formats[format];

      if (!config) return [];
      if (typeof config === 'function') return [];

      if (typeof config === 'object') {
        return Object.keys(config);
      }

      return [];
    },
  };

  #createDiv() {
    const div = document.createElement('div');

    div.setAttribute('data-repl-output', '');
    div.id = nextId();

    return div;
  }

  /**
   * @param {'error' | 'info'} type
   * @param {string} message
   */
  #announce(type, message) {
    if (!this.#options?.on?.log) return;

    this.#options.on.log(type, message);
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

  /**
   * @param {string} message
   */
  announceError(message) {
    this.#announce('error', message);
  }
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
 * @param {string} url
 * @returns {string}
 */
function extensionOf(url) {
  return url.split('/').pop()?.split('.').pop() ?? '';
}

/**
 * CDNs will pre-process every file to make sure every import goes through them.
 * We don't want this.
 *
 * @param {string} id
 * @returns {string}
 */
function deCDN(id) {
  const noQPs = id.split('?')[0];

  return /** @type {string} */ (noQPs);
}
