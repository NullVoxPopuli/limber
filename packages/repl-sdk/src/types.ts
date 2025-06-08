import type { FileDescription } from 'tarparser';

export interface RequestAnswer {
  inTarFile: string;
  ext: string;
  from: string;
}

export interface PublicMethods {
  /**
   * Will try to use a shimmed import, or will return null.
   */
  tryResolve: (
    moduleName: string,
    fallback?: (moduleName: string) => Promise<unknown>
  ) => Promise<unknown>;

  /**
   * Import many modules in parallel.
   * For each array entry,
   *   Will try to use a shimmed import, or will return null.
   *
   * Optionally accepts a fallback function for proxying to a CDN, if desired.
   *
   */
  tryResolveAll: (
    moduleNames: string[],
    fallback?: (moduleName: string) => Promise<unknown>
  ) => Promise<unknown[]>;
  compile: (
    format: string,
    text: string,
    options?: {
      flavor?: string;
      fileName?: string;
    }
  ) => Promise<HTMLElement>;

  optionsFor: (format: string, flavor?: string) => Omit<CompilerConfig, 'compiler'>;
}
export interface ResolvedCompilerOptions {
  importMap: { [importPath: string]: string };
  resolve: { [importPath: string]: unknown };
  needsLiveMeta?: boolean;
  versions?: { [packageName: string]: string };
  userOptions?: Options['options'];
}

export interface Compiler {
  /**
   * Convert a string from "fileExtension" to standard JavaScript.
   * This will be loaded as a module and then passed to the render method.
   *
   * You may return either just a string, or an object with a `compiled` property that is a string -- any additional properties will be passde through to the render function -- which may be useful if there is accompanying CSS.
   */
  compile: (text: string) => Promise<string | ({ compiled: string } & Record<string, unknown>)>;
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
  ) => Promise<void>;
}

export interface CompilerConfig {
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
   *
   */
  resolve?: (id: string) => string | undefined;

  compiler: (
    /**
     * The config for the compiler may be passed by the caller.
     * Common use case for this object is specifying what versions
     * of the compiler/library/framework dependencies to use.
     */
    config: Record<string, unknown>,
    /**
     * The public methods provided from the compiler
     */
    api: PublicMethods
  ) => Promise<Compiler>;

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
    [fileExtension: string]: (text: string) => Promise<string>;
  };
}

export interface Options {
  /**
   * Map of import paths to URLs
   *
   * Thehse will take precedence over the default CDN fallback.
   */
  importMap?: { [importPath: string]: string };
  /**
   * Map of pre-resolved JS values to use as the import map
   * These could assume the role of runtime virtual modules.
   *
   * These will take precedence over the importMap, and implicit CDN fallback.
   */
  resolve?: { [importPath: string]: unknown };

  /**
   * Specifies which vesions of dependencies to when pulling from a CDN.
   * Defaults to latest.
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

export interface UntarredPackage {
  /**
   * the package.json
   */
  manifest: {
    name: string;
    version: string;
    exports?: ManifestExports;
    imports?: Record<string, ManifestImports>;
    main?: string;
    module?: string;
    browser?: string;
  };
  contents: {
    [path: string]: FileDescription;
  };
}

type ManifestExport = string | string[] | { [condition: string]: ManifestExport };

export interface ManifestExports {
  [importPath: string]: ManifestExport;
}
