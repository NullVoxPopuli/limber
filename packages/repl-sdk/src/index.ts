export const defaultFormats: Options['formats'] = {
  mermaid: {
    compiler: async () => {
      return {
        compile: async (text) => {
        }
      }
    }
  }
};

export const defaults = {
  formats: defaultFormats,
};

export interface Options<Extension extends string> {
  formats: {
    [fileExtension: Extension]: {
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
      compiler: () => Promise<{
        /**
         * Convert a string from "fileExtension" to standard JavaScript.
         * This will be loaded as a module and then passed to the render method.
         */
        compile: (text: string) => Promise<string>;
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
         * @param {any} the default export from the compiled module.
         */
        render: (element: HTMLElement, defaultExport: any) => void;
      }>;
    }
  }
}

export class Compiler<Extension> {
  #options: Options<Extension>;

  /**
   * Options may be passed to the compiler to add to its behavior.
   */
  constructor(options: Options<Extension> = defaults) {
    this.#options = options;
  }

  compile = async (format: string, text: string): Promise<HTMLElement> => {
    const config = this.#options.formats[format];

    assert(
      `${format} is not a configured format. `
      + `The currently configured formats are ${Object.keys(this.#options.formats).join(', ')}`,
      config
    );

    const compiler = await config.compiler();
    // TODO: pass this through es-module-shims
    //       for getting the actual module back
    const compiledText = await compiler.compile(text);


    const div = this.#createDiv();

    compiler.render(div, compiledText);

    return div;
  }

  #createDiv = () => {
    let div = document.createElement('div');
    div.setAttribute('data-repl-output', '');
    return div;
  }
}


function assert(message: string, test: unknown): asserts test {
  if (!test) {
    throw new Error(message);
  }
}
