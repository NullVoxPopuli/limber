interface PublicMethods {
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
  versions: { [packageName: string]: string };
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

  compiler: (
    /**
     * The config for the compiler may be passed by the caller.
     * Common use case for this object is specifying what versions
     * of the compiler/library/framework dependencies to use.
     */
    config: Record<string, unknown>
  ) => Promise<{
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
      defaultExport: any,
      extras: { compiled: string } & Record<string, unknown>,
      compiler: PublicMethods
    ) => void;
  }>;
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

  formats: {
    [fileExtension: string]:
      | CompilerConfig
      | {
          [flavor: string]: CompilerConfig;
        };
  };
}
