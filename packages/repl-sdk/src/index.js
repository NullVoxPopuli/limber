/**
 * @typedef {import("./types.ts").Options} Options
 * @typedef {import('./types.ts').CompilerConfig} CompilerConfig
 */

import { cache } from './cache.js';
import { compilers } from './compilers.js';
import { STABLE_REFERENCE } from './es-module-shim.js';
import { takeEntry, writeEntry } from './fs/entry.js';
import { clearFs, storage } from './fs/store.js';
import {
  DEPS_PREFIX,
  NODE_MODULES_PREFIX,
  parseNpmUrl,
  parseResolvingUrl,
  parseVirtualUrl,
  pathOf,
  RESOLVING_PREFIX,
  resolvingUrl,
  SRC_PREFIX,
} from './fs/url.js';
import { fsWorker } from './fs/worker.js';
import { Pipeline, reexport } from './plugins.js';
import { fromConfigResolve, fromHandlers } from './plugins/compiler-config.js';
import { externalFiles } from './plugins/external.js';
import { npm } from './plugins/npm.js';
import { providedModules } from './plugins/provided.js';
import { parseSpecifier } from './specifier.js';
import { assert, errorMessage, nextId } from './utils.js';

assert(`There is no document. repl-sdk is meant to be ran in a browser`, globalThis.document);

/**
 * Specifier URL → the package that it installed.
 *
 * A later compile finds the module in the loader's cache,
 * so the source hook does not run again for it.
 * The loader is global, so this is too.
 *
 * @type {Map<string, { name: string, version: string }>}
 */
const installed = new Map();

export { errorMessage } from './utils.js';

export const defaultFormats = Object.keys(compilers);

export const defaults = {
  formats: compilers,
};

export class Compiler {
  /** @type {Options} */
  #options;

  /**
   * The package versions for the compile in progress.
   * A compile can pass its own, else the `versions` option applies.
   *
   * @type {{ [packageName: string]: string }}
   */
  #versions;

  /** @type {Pipeline} */
  #pipeline;

  /** @type {ReturnType<typeof providedModules>} */
  #provided;

  /**
   * The import map of es-module-shims. Only built-in plugins use it.
   *
   * @type {(id: string, parentUrl: string) => string}
   */
  #defaultResolve = () => {
    throw new Error(`The import map is not ready. Has es-module-shims loaded?`);
  };

  /**
   * Options may be passed to the compiler to add to its behavior.
   * @param {Partial<Options>} options
   */
  constructor(options = defaults) {
    this.#options = Object.assign({}, defaults, options);
    this.#versions = this.#options.versions ?? {};

    const defaultResolve = () => this.#defaultResolve;

    this.#provided = providedModules(this.#options.resolve, this.#options.packages);
    this.#pipeline = new Pipeline((this.#options.plugins ?? []).concat(this.#provided), [
      externalFiles(),
      npm(defaultResolve),
    ]);

    STABLE_REFERENCE.resolve = this.#resolve;
    STABLE_REFERENCE.source = this.#source;

    window.addEventListener('unhandledrejection', this.#handleUnhandledRejection);
  }

  /**
   * Runs the `buildStart` of every plugin.
   * For example, the Ember plugins install a pinned ember-source
   * before anything imports one of its `@ember/*` modules.
   *
   * `compile` calls this. A host calls it first to load pinned modules before a compile.
   * With a format, the plugins of that format's compiler config run too,
   * even when that compiler has not loaded yet.
   *
   * @param {Record<string, string>} [versions]
   * @param {string} [format]
   * @param {string} [flavor]
   */
  async prepare(versions = this.#options.versions ?? {}, format, flavor) {
    // @ts-ignore
    await import('es-module-shims');

    this.#versions = versions;

    if (format) {
      this.#pipeline.register(this.#pluginsOf(this.#resolveFormat(format, flavor)));
    }

    await this.#pipeline.buildStart(versions);
  }

  /**
   * Loads modules the way a compiler does: from the `resolve` option first, then from npm.
   *
   * @param {string[]} names
   */
  tryResolveAll = (names) => this.#nestedPublicAPI.tryResolveAll(names);

  /**
   * The file system: installed packages under `/node_modules`, and the
   * compiled snippet under `/src`. Resolution does not read it; it is here so
   * a REPL can show what a demo actually ran against.
   */
  get fs() {
    return storage;
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
        this.#announce('error', message, e.reason);
        handled = true;
      });
      if (handled) break;
    }

    if (handled) return;

    this.#announce('error', errorMessage(e.reason), e.reason);
  };

  /**
   * The es-module-shims resolve hook, which must be synchronous.
   *
   * When every plugin answers synchronously, the answer is the URL.
   * Else this returns a placeholder URL, and the source hook waits for the answer.
   *
   * @param {string} id
   * @param {string} parentUrl
   * @param {(id: string, parentUrl: string) => string} resolve
   * @returns {string}
   */
  #resolve = (id, parentUrl, resolve) => {
    this.#defaultResolve = resolve;
    this.#announce('info', `Loading ${id.split('?')[0]}`);
    this.#log('[resolve]', id, 'from', parentUrl);

    /**
     * A placeholder only imports the answer, which is resolved already.
     */
    if (parentUrl.startsWith(RESOLVING_PREFIX)) return id;

    const answer = this.#pipeline.resolveId(id, parentUrl);

    if (typeof answer !== 'string') {
      if (answer) return resolvingUrl(id, parentUrl);

      return resolve(id, parentUrl);
    }

    this.#log(`[resolve] ${id} → ${answer}`);

    if (parentUrl.startsWith(SRC_PREFIX)) {
      this.#reportDependency(this.#packageOf(answer));
    }

    return answer;
  };

  /**
   * The es-module-shims source hook, which supersedes the fetch hook
   * (es-module-shims marks `fetch` deprecated in favor of this one).
   *
   * This is where the async work lives. es-module-shims uses the returned URL
   * as the base for that module's own relative imports,
   * so `resolve` can answer with a URL that only names a package.
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
    const resolving = parseResolvingUrl(path);

    if (resolving) {
      const { id, importer } = resolving;
      const answer = await this.#pipeline.resolveId(id, importer);

      assert(`Could not resolve '${id}' from ${importer}`, answer);

      this.#log(`[source] ${id} → ${answer}`);

      if (importer.startsWith(SRC_PREFIX)) {
        this.#reportDependency(this.#packageOf(answer));
      }

      return { url, type: 'js', source: reexport(answer) };
    }

    if (path.startsWith(SRC_PREFIX)) {
      const text = takeEntry(url) ?? (await storage.read(pathOf(path)));

      assert(`${path} is not in the fs`, text !== undefined);

      this.#log('[source] src', path);

      /**
       * Always js: whatever the format was, a compiler has already turned it
       * into a module.
       */
      return { url, type: 'js', source: text };
    }

    const loaded = await this.#pipeline.load(path);

    if (!loaded) {
      this.#log('[source] passing through', path);

      return defaultSourceHook(url, fetchOpts, parent);
    }

    this.#log('[source]', path, '→', loaded.url);

    /**
     * A bare specifier lands here once per package.
     * Files inside a package already have their real URL.
     */
    if (path.startsWith(NODE_MODULES_PREFIX) && !path.startsWith(DEPS_PREFIX)) {
      const pkg = parseNpmUrl(loaded.url);

      if (pkg) installed.set(path, pkg);
      if (parent?.startsWith(SRC_PREFIX)) this.#reportDependency(pkg);
    }

    this.#announce('info', `Loaded ${parseVirtualUrl(path)?.name ?? loaded.url}`);

    return { ...loaded, url: loaded.url === path ? url : loaded.url };
  };

  /**
   * @param {string} format
   * @param {string} text
   * @param {{ fileName?: string, flavor?: string, args?: Record<string, unknown>, versions?: Record<string, string>, [key: string]: unknown }} [ options ]
   * @returns {Promise<{ element: HTMLElement, destroy: () => void }>}
   */
  async compile(format, text, options = {}) {
    this.#announce('info', `Compiling ${format}`);

    try {
      return await this.#compile(format, text, options);
    } catch (e) {
      // for on.log usage
      this.#announce('error', errorMessage(e), e);

      // Don't hide errors!
      this.#error(e);
      throw e;
    }
  }

  /**
   * @param {string} format
   * @param {string} text
   * @param {{ fileName?: string, flavor?: string, versions?: Record<string, string>, [key: string]: unknown }} [ options ]
   * @returns {Promise<{ element: HTMLElement, destroy: () => void }>}
   */
  async #compile(format, text, options) {
    this.#log('[compile] idempotently installing es-module-shim');

    // @ts-ignore
    await import('es-module-shims');

    const opts = { ...options };

    opts.fileName ||= `index.${format}`;
    await this.prepare(opts.versions, format, opts.flavor);

    this.#log('[compile] compiling');

    const compiler = await this.#getCompiler(format, opts.flavor);
    const compiled = await compiler.compile(text, opts);

    /** @type {string} */
    let compiledText;
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

    const entryUrl = await writeEntry(fsWorker(), opts.fileName, compiledText);

    // @ts-ignore
    const { default: defaultExport } = await shimmedImport(/* @vite-ignore */ entryUrl);

    this.#log('[compile] preparing to render', defaultExport, extras);

    return this.#render(compiler, defaultExport, {
      ...extras,
      ...(opts.args ? { args: opts.args } : {}),
    });
  }

  #compilerCache = new WeakMap();

  /**
   * Compiler configs share a `resolve` function, such as gjs and gts.
   *
   * @type {WeakMap<NonNullable<CompilerConfig['resolve']>, import('./types.ts').Plugin>}
   */
  #resolvePlugins = new WeakMap();
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

    if (config.onUnhandled) {
      this.#compilerOnUnhandled.add(config.onUnhandled);
    }

    /**
     * Before the compiler loads, because loading it can import modules.
     */
    await this.#pipeline.add(this.#pluginsOf(config));

    const options = this.optionsFor(format, flavor);
    const compiler = await config.compiler(options, this.#nestedPublicAPI);

    this.#compilerCache.set(config, compiler);

    if (compiler.handlers) {
      await this.#pipeline.add([fromHandlers(compiler)]);
    }

    return compiler;
  }

  /**
   * @param {CompilerConfig} config
   * @returns {import('./types.ts').Plugin[]}
   */
  #pluginsOf(config) {
    const plugins = (config.plugins ?? []).slice();

    if (config.resolve) {
      let plugin = this.#resolvePlugins.get(config.resolve);

      if (!plugin) {
        plugin = fromConfigResolve(config.resolve);
        this.#resolvePlugins.set(config.resolve, plugin);
      }

      plugins.push(plugin);
    }

    return plugins;
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
    const compiler = this;

    return {
      needsLiveMeta: /* @type {boolean | undefined} */ needsLiveMeta ?? true,
      ...(this.#resolveUserOptions(format, flavor) ?? {}),
      /**
       * A compiler keeps its config for the life of the page,
       * and the versions belong to the compile in progress.
       */
      get versions() {
        return compiler.#versions;
      },
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
    if (!result && fallback) {
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
          if (!results[i] && morePromises[i]) {
            results[i] = await morePromises[i];
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
   * The package that a resolved URL belongs to, when the URL says so.
   * No version means that the caller provided the module.
   *
   * @param {string} url
   * @returns {undefined | { name: string, version: string | undefined }}
   */
  #packageOf(url) {
    const virtual = parseVirtualUrl(url);

    if (virtual) {
      return virtual.kind === 'manual'
        ? { name: this.#provided.packageOf(virtual.name), version: undefined }
        : undefined;
    }

    return installed.get(url) ?? exactPackage(url);
  }

  /**
   * No version means that the caller provided the module.
   *
   * @param {{ name: string, version: string | undefined } | undefined} pkg
   */
  #reportDependency(pkg) {
    if (!pkg) return;

    this.#options.on?.dependency?.(pkg.name, pkg.version);
  }

  /**
   * @param {'error' | 'info'} type
   * @param {string} message
   * @param {unknown} [error] what was thrown, for an error
   */
  #announce(type, message, error) {
    if (!this.#options?.on?.log) return;

    this.#options.on.log(type, message, error);
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
 * The package of an npm URL that names an exact version,
 * like the renamed modules of a pinned package.
 *
 * @param {string} url
 * @returns {undefined | { name: string, version: string }}
 */
function exactPackage(url) {
  const inDeps = parseNpmUrl(url);

  if (inDeps) return inDeps;
  if (!url.startsWith(NODE_MODULES_PREFIX)) return;

  const { name, version } = parseSpecifier(url.slice(NODE_MODULES_PREFIX.length));

  return version && EXACT_VERSION.test(version) ? { name, version } : undefined;
}

const EXACT_VERSION = /^\d+\.\d+\.\d+(-[\w.]+)?$/;
