/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RequestAnswer {
  inTarFile: string;
  ext: string;
  from: string;
}

export interface PublicMethods {
  announce: (type: 'error' | 'info', message: string) => void;
  getCompiler: (format: string, flavor?: string) => Promise<Compiler>;
  getAllowedFormats: () => string[];
  getFlavorsFor: (format: string) => string[];

  /**
   * Imports a module through the plugins, the way an import in a document does,
   * so the pins of the compile apply.
   * `fallback` runs when the import fails.
   */
  tryResolve: (
    moduleName: string,
    fallback?: (moduleName?: string) => Promise<object | undefined>
  ) => Promise<any>;

  /**
   * `tryResolve` for many modules at once.
   */
  tryResolveAll: (
    moduleNames: string[],
    fallback?: (moduleName?: string) => Promise<unknown>
  ) => Promise<any[]>;
  compile: (
    format: string,
    text: string,
    options?: {
      flavor?: string;
      fileName?: string;
      /**
       * Package versions for the bare imports of this compile.
       * Overrides the `versions` option.
       */
      versions?: { [packageName: string]: string };
    }
  ) => Promise<{ element: HTMLElement; destroy: () => void }>;

  optionsFor: (
    format: string,
    flavor?: string
  ) => {
    versions?: { [packageName: string]: string };
    needsLiveMeta?: boolean;
    [option: string]: unknown;
  };

  /**
   * Does this compiler support the given format?
   */
  canCompile: (
    format: string,
    flavor?: string
  ) =>
    | {
        result: true;
      }
    | { result: false; reason: string };
}
type CompileResult =
  | string
  | {
      compiled: string;
      [option: string]: unknown;
    };

export interface Compiler {
  /**
   * Convert a string from "fileExtension" to standard JavaScript.
   * This will be loaded as a module and then passed to the render method.
   *
   * You may return either just a string, or an object with a `compiled` property that is a string -- any additional properties will be passde through to the render function -- which may be useful if there is accompanying CSS.
   */
  compile: (text: string, options: Record<string, unknown>) => Promise<CompileResult>;

  /**
   * For the root of a node rendered for this compiler,
   * how will this particular library / framework
   * render in to the given element?
   *
   * Example:
   * ```js
   * {
   *   async compiler() {
   *     const { createRoot } = await import('react-dom/client');
   *
   *     return {
   *        render(element, defaultExport) {
   *          const root = createRoot(element);
   *
   *          root.render(defaultExport);
   *        },
   *        // ...
   *     }
   *   }
   * }
   * ```
   *
   * @param {HTMLElement} the element to render in to, this is provided by repl-sdk.
   * @param {any} defaultExport the default export from the compiled module.
   * @param {{ compiled: string } & Record<string, unknown>} extras the compiled string (for reference), as well as any extra information that may have been returned from the compile function.
   */
  render: (
    element: HTMLElement,
    defaultExport: unknown,
    extras: { compiled: string } & Record<string, unknown>,
    compiler: PublicMethods
  ) => Promise<void | (() => void)>;

  /**
   * Sometimes libraries do not publish browser-compatible modules,
   * and require additional transpilation.
   * Usually this happens by the consuming application's build process -- but in this REPL,
   * we are kind of not exactly a consuming application, but still need to handle the further
   * build concerns.
   *
   * For example, `import.meta.env.DEV` is not a platform native thing that and requires
   * a build plugin. Vite has one built in, but all other tools need to manually specify
   * what to do with `import.meta.env.DEV`.
   *
   * Another example, some component frameworks may use templates, which can only be compiled
   * by the host application, as the details of how a template is compiled are private API,
   * and can vary in minor releases of the template compiler.
   *
   * This should be a map of file extensions to async functions that must return either the
   * original file text or additionally transformed text.
   *
   * ```js
   * handlers: {
   *   // When resolving a .js file from a CDN or NPM, replace `import.meta.env.DEV` with `true`
   *   js: async(text) => {
   *     return text.replaceAll('import.meta.env.DEV', 'true');
   *   }
   * }
   * ```
   *
   * This could also be used to run the same build step on fetched files as
   * the files provided to the REPL.
   *
   * ```js
   * let compiler = {
   *   compile: async (text) => { ... },
   *   render: async (element, compiled, ...rest) => { ... },
   *   handlers: {
   *     js: async(text) => {
   *       return compiler.compile(text);
   *     }
   *   }
   * }
   * ```
   */
  handlers?: {
    [fileExtension: string]: (text: string) => Promise<CompileResult>;
  };
}

export interface PluginContext {
  /**
   * The package versions of the compile in progress.
   */
  versions: { [packageName: string]: string };
}

export type LoadResult =
  | string
  | {
      source: string;
      /**
       * Defaults to the type that the extension of `url` (or of the id) implies.
       */
      type?: 'js' | 'css' | 'json' | 'ts';
      /**
       * The URL of the module, for `import.meta.url` and its relative imports.
       * Defaults to the id.
       */
      url?: string;
    };

type MaybePromise<T> = T | Promise<T>;

/**
 * Hooks in the shape of Rollup's.
 *
 * Every hook is optional. For `resolveId` and `load`, the first plugin to return
 * a value wins, in order:
 * 1. `Options.plugins`
 * 2. the `resolve` option
 * 3. the `plugins` (and `resolve`) of each compiler config, in the order they loaded
 * 4. CDN URLs, which are stored under `file:///external/<host>/`
 * 5. npm
 */
export interface Plugin {
  name: string;

  /**
   * Before each compile.
   */
  buildStart?: (ctx: PluginContext) => MaybePromise<void>;

  /**
   * Return the id of the module that `source` names, or nothing to pass.
   * An id is a URL in the file system, such as `file:///node_modules/...`,
   * or an http(s) URL, which is downloaded into the file system.
   *
   * A synchronous answer is used as-is.
   * A promise costs one extra small module per importer until the answer is cached.
   * The cache is cleared before each compile.
   */
  resolveId?: (
    source: string,
    importer: string,
    ctx: PluginContext
  ) => MaybePromise<string | null | undefined>;

  /**
   * Return the text of the module with this id, or nothing to pass.
   */
  load?: (id: string, ctx: PluginContext) => MaybePromise<LoadResult | null | undefined>;

  /**
   * Change the text of a loaded module, or return nothing to keep it.
   * Runs for every plugin, in order.
   */
  transform?: (
    code: string,
    id: string,
    ctx: PluginContext
  ) => MaybePromise<string | null | undefined>;
}

export interface CompilerConfig {
  /**
   * Loaded with the compiler, the first time that its format compiles.
   * The module loader is global for the page,
   * so these apply to modules of every format after that.
   */
  plugins?: Plugin[];

  /**
   * Extensions for codemirror, providing syntax highlighting and other editor features (completions, etc)
   */
  codemirror: {
    lang: () => Promise<unknown>;
    support?: () => Promise<unknown>;
  };

  /**
   * When using this file extension in markdown documents,
   * should we only evaluate the code block if the "live"
   * meta is attached to the codefence?
   *
   * If you don't use markdown-embedded rendering,
   * you can ignore this option. Default behavior is "false",
   * but it doesn't matter if you don't render markdown anyway.
   *
   * For example, with `needsLiveMeta: false`:
   * \`\`\`js
   * console.log('hello');
   * \`\`\`
   * will be evaluated and log to the console.
   * However, with `needsLiveMeta: true`, the above snippet would not
   * be evaluated. To evaluate a snippet with `needsLiveMeta: true`:
   * \`\`\`js live
   * console.log('hello');
   * \`\`\`
   */
  needsLiveMeta?: boolean;

  /**
   * Synchronously extend the way resolution works
   * This is "import map as a function", which allows for more flexibility than just the static import map.
   *
   * This may not return a promise.
   * But we can return functions that return promises.
   *
   * An http(s) URL is downloaded into the file system, like any other CDN URL.
   * `plugins` can do the same, and more.
   */
  resolve?: (
    id: string,
    /**
     * The package versions of the compile in progress.
     */
    versions?: { [packageName: string]: string }
  ) =>
    string | (() => Record<string, unknown>) | (() => Promise<Record<string, unknown>>) | undefined;

  /**
   * This optional method provides the opportunity to reformat messages that would be displayed to the REPL.
   */
  onUnhandled?: (e: PromiseRejectionEvent, handle: (msg: string) => void) => void;

  compiler: (
    /**
     * The config for the compiler may be passed by the caller.
     * Common use case for this object is specifying what versions
     * of the compiler/library/framework dependencies to use.
     */
    config: { versions: { [packageName: string]: string }; [option: string]: unknown },
    /**
     * The public methods provided from the compiler
     */
    api: PublicMethods
  ) => Promise<Compiler>;
}

export interface Options {
  /**
   * Events will be emitted on this object.
   * Not required, but could be useful for providing lots of feedback to the user.
   */
  on?: {
    /**
     * Public-log messages will be emitted here.
     * These include:
     * - errors
     * - what is being fetched / compiled
     *
     * For an error, `error` is what was thrown, such as an `Error` with a stack.
     */
    log?: (type: 'error' | 'info', message: string, error?: unknown) => void;
    /**
     * A package that the document imports, with the version that loaded from npm.
     * The version is `undefined` when the module came from the `resolve` option.
     * A module from `resolve` is reported under its package, see `packages`.
     * Imports from inside other packages are not reported.
     */
    dependency?: (name: string, version: string | undefined) => void;
  };

  /**
   * Map of pre-resolved JS values to use as the import map
   * These could assume the role of runtime virtual modules.
   *
   * These will take precedence over the importMap, and implicit CDN fallback.
   */
  resolve?: { [importPath: string]: unknown };

  /**
   * What the modules in `resolve` are, by npm package.
   *
   * A compile that pins a package with `versions` loads it from npm,
   * in place of the modules in `resolve`.
   * This tells which modules belong to which package, and what they need:
   *
   * ```js
   * packages: {
   *   'ember-source': { version: '7.3.0', modules: ['@ember/owner', '@glimmer/tracking'] },
   *   'ember-primitives': { builtWith: ['ember-source'] },
   * }
   * ```
   *
   * A module that is not in any `modules` list belongs to the package that its name starts with.
   */
  packages?: {
    [packageName: string]: {
      /**
       * The version in `resolve`.
       * A pin that accepts this version keeps the modules in `resolve`.
       * Without it, any pin loads the package from npm.
       */
      version?: string;
      /**
       * Modules in `resolve` that belong to this package, when their names do not say so.
       */
      modules?: string[];
      /**
       * Packages that these modules import.
       * A pin of one of them loads this package from npm too, so that both match.
       */
      builtWith?: string[];
    };
  };

  /**
   * Modules that load before each compile, through the plugins, so the pins apply.
   * `importSync` from `@embroider/macros` answers with these,
   * because it must answer at once. See `preloaded` too.
   */
  preload?: string[];

  /**
   * Change how modules resolve, load, and transform.
   * These run before every other source of modules.
   */
  plugins?: Plugin[];

  /**
   * The versions of packages to load, by package name.
   * A compile can pass its own, which replace these.
   */
  versions?: { [packageName: string]: string };

  /**
   * Map of file extensions to compiler configurations
   */
  formats: {
    [fileExtension: string]:
      | CompilerConfig
      | {
          [flavor: string]: CompilerConfig;
        };
  };

  options?: {
    [format: string]:
      | KnownDefaultOptions
      | {
          [flavor: string]: { [option: string]: unknown };
        }
      | {
          [option: string]: unknown;
        };
  };

  /**
   * Show extra debug logging or not
   */
  logging?: boolean | undefined;
}

interface KnownDefaultOptions {
  md?: {
    rehypePlugins?: unknown[];
    remarkPlugins?: unknown[];
    CopyComponent?: string;
    ShadowComponent?: string;
  };
}

import type { ImportMap as ManifestImports } from 'resolve.imports';

export interface InstalledPackage {
  /**
   * the package.json
   */
  manifest: {
    name: string;
    version: string;
    /**
     * `"exports": "./index.js"` is valid, which is why resolve.js has
     * fromExportsString.
     */
    exports?: ManifestExports | string;
    imports?: Record<string, ManifestImports>;
    /**
     * Where a package's dependency versions come from. Each becomes an import
     * map scope, so two packages can depend on different versions of the same
     * thing.
     */
    dependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    /**
     * Never scoped. See Installer#scopeDependencies.
     */
    peerDependencies?: Record<string, string>;
    main?: string;
    module?: string;
    browser?: string;
    /**
     * v2 addons, see compilers/ember/renamed-modules.js.
     */
    'ember-addon'?: { 'renamed-modules'?: Record<string, string> };
  };
  /**
   * Every file in the package, relative to its root. The files themselves are
   * in the fs; this is what resolution needs.
   */
  files: Set<string>;
}

type ManifestExport = string | string[] | { [condition: string]: ManifestExport };

export interface ManifestExports {
  [importPath: string]: ManifestExport;
}

export interface InfoMessage {
  type: 'info';
  message: string;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
  /**
   * What was thrown, when there was a throw.
   */
  error?: unknown;
}

export type Message = InfoMessage | ErrorMessage;
