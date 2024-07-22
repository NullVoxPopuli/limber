/**
 * @typedef {import("./types.ts").Options} Options
 */
import { assert } from './utils.js';

export const defaultFormats = {
  mermaid: {
    compiler: async () => {
      return {
        compile: async (text) => {},
      };
    },
  },
};

export const defaults = {
  formats: defaultFormats,
};

export class Compiler {
  /** @type {Options} */
  #options;

  /**
   * Options may be passed to the compiler to add to its behavior.
   */
  constructor(options = defaults) {
    this.#options = options;
  }

  /**
   * @param {string} format
   * @param {string} text
   */
  async compile(format, text) {
    const config = this.#options.formats[format];

    assert(
      `${format} is not a configured format. ` +
        `The currently configured formats are ${Object.keys(this.#options.formats).join(', ')}`,
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

  #createDiv() {
    let div = document.createElement('div');
    div.setAttribute('data-repl-output', '');
    return div;
  }
}
