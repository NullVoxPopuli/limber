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

const secret = Symbol.for('__repl-sdk__compiler__');

assert(
  `There is already an instance of repl-sdk, and there can only be one. Make sure that your dependency graph is correct.`,
  !globalThis[secret]
);

export class Compiler {
  /** @type {Options} */
  #options;

  /** @type {((id: string) => string | undefined)[] } */
  #resolvers = [];

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
      resolve: (id) => {
        if (id.startsWith('blob:')) return id;
        if (id.startsWith('https://')) return id;
        if (id.startsWith('.')) return id;

        for (let resolver of this.#resolvers) {
          let result = resolver(id);

          if (result) return result;
        }
        console.log('resolve', id);

        return `https://esm.sh/*${id}`;
      },
      // Hook source fetch function
      fetch: async (url, options) => {
        console.log('fetching url', url);
        const response = await fetch(url, options);

        return response;
      },
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

    const { default: defaultExport } = await importShim(/* @vite-ignore */ asBlobUrl);

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
    if (compiler.resolve) {
      this.#resolvers.push(compiler.resolve);
    }

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

  get #nestedPublicAPI() {
    return {
      compile: (...args) => this.compile(...args),
      optionsFor: (...args) => this.optionsFor(...args),
    };
  }

  #createDiv() {
    let div = document.createElement('div');

    div.setAttribute('data-repl-output', '');
    div.id = nextId();

    return div;
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
