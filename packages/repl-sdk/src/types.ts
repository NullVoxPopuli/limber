/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FileDescription } from 'tarparser';

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
   * Will try to use a shimmed import, or will return null.
   */
  tryResolve: (
    moduleName: string,
    fallback?: (moduleName?: string) => Promise<object | undefined>
  ) => Promise<any>;

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
    fallback?: (moduleName?: string) => Promise<unknown>
  ) => Promise<any[]>;
  compile: (
    format: string,
    text: string,
    options?: {
      flavor?: string;
      fileName?: string;
      [key: string]: unknown;
    }
  ) => Promise<{ element: HTMLElement; destroy: () => void }>;

  /**
   * Build-time variant of {@link PublicMethods.compile}: returns the compiled
   * source as a string rather than evaluating it and rendering to a DOM
   * element.
   *
   * Useful for SSG / pre-rendering pipelines that want to take a live demo's
   * compiled output and hand it to their own bundler instead of executing it
   * in the browser.
   */
  compileToSource: (
    format: string,
    text: string,
    options?: Record<string, unknown>
  ) => Promise<{ source: string }>;

  optionsFor: (
    format: string,
    flavor?: string
  ) => {
    resolve?: (id: string) => string | undefined;
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
export interface ResolvedCompilerOptions {
  resolve: { [importPath: string]: unknown };
  needsLiveMeta?: boolean;
  versions?: { [packageName: string]: string };
  userOptions?: Options['options'];
}

type CompileResult =
  | string
  | {
      compiled: string;
      [option: string]: unknown;
    }
  /**
   * Variant returned by compilers when invoked with `renderToString: true` —
   * the build-time form, where no rendering happens and the caller receives
   * the compiled JS module source as a string instead of a rendered element.
   */
  | { source: string; [option: string]: unknown };

/**
 * Per-compile API: everything in {@link PublicMethods}, plus the
 * {@link CompileAPI.provideScope | provideScope} method whose registrations
 * are scoped to the compile call (and any render it triggers).
 *
 * The Compiler hands a fresh `CompileAPI` to every `compile()` / `render()`
 * invocation and disposes the registry it tracks after the compile's
 * destroy fires — individual compilers never have to remember to release
 * what they registered.
 */
export interface CompileAPI extends PublicMethods {
  /**
   * Register a JS value behind a Compiler-generated virtual ES module
   * specifier, and return that specifier. The emitted source for this
   * compile can then `import * as foo from '<specifier>'` and the
   * Compiler's existing `manual:` resolver hands the value back.
   *
   * The registration is bound to this compile's lifecycle: when the
   * compile's `destroy()` is called (or the compile throws before
   * reaching a render), the Compiler releases the entry automatically.
   * Compilers do not — and should not — track an unregister callback.
   */
  provideScope: (value: unknown) => { specifier: string };
}

export interface Compiler {
  /**
   * Convert a string from "fileExtension" to standard JavaScript.
   * This will be loaded as a module and then passed to the render method.
   *
   * You may return either just a string, or an object with a `compiled` property that is a string -- any additional properties will be passde through to the render function -- which may be useful if there is accompanying CSS.
   *
   * The third `api` argument is a per-compile API: same surface as the
   * factory-time `PublicMethods`, plus `provideScope(value)` whose
   * registrations are auto-released by the Compiler when the compile's
   * destroy fires. Existing implementations may ignore it.
   */
  compile: (
    text: string,
    options: Record<string, unknown>,
    api?: CompileAPI
  ) => Promise<CompileResult>;

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
    compiler: CompileAPI
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

export interface CompilerConfig {
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
   */
  resolve?: (
    id: string
  ) =>
    | string
    | (() => Record<string, unknown>)
    | (() => Promise<Record<string, unknown>>)
    | undefined;

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
     */
    log?: (type: 'error' | 'info', message: string) => void;
  };

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

export interface InfoMessage {
  type: 'info';
  message: string;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export type Message = InfoMessage | ErrorMessage;
