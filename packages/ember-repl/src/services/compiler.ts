/* eslint-disable getter-return */
 
// @ts-ignore
import { tracked } from '@glimmer/tracking';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';
import { assert } from '@ember/debug';
import { registerDestructor } from '@ember/destroyable';
import { array, concat, fn, get, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { getOwner } from '@ember/owner';
import { precompileTemplate } from '@ember/template-compilation';
import { waitFor } from '@ember/test-waiters';

import { createStore } from 'ember-primitives/store';
import { resource } from 'ember-resources';
import { Compiler } from 'repl-sdk';
import { visit } from 'unist-util-visit';

import { nameFor } from '../compile/utils.ts';
import { modules } from './known-modules.ts';

import type { CompileResult, ModuleMap } from '../compile/types.ts';
import type { ComponentLike } from '@glint/template';
import type { EditorView } from 'codemirror';
import type { ErrorMessage, InfoMessage, Message } from 'repl-sdk';

export function getCompiler(context: object) {
  const owner = getOwner(context) ?? context;

  assert(`Missing owner. Cannot use ember-repl's compiler without an owner.`, owner);

  return createStore(owner, CompilerService);
}

/**
 * Old way to make static components, because
 * https://github.com/emberjs/ember.js/issues/20913
 *
 * The runtime compiler doesn't allow you to catch compiler errors.
 * This particular component doesn't need to be runtime anyway.
 */
function rendersElement(x: { element: Element; destroy: () => void }): ComponentLike {
  const render = resource(({ on }) => {
    on.cleanup(() => {
      x.destroy();
    });

    return x.element;
  });

  return setComponentTemplate(
    precompileTemplate(`{{render}}`, {
      strictMode: true,
      scope: () => ({ render }),
    }),
    templateOnly()
  ) as ComponentLike;
}

interface CompilerOptions {
  hbs?: {
    scope?: Record<string, unknown>;
  };
  md?: {
    remarkPlugins?: unknown[];
    rehypePlugins?: unknown[];
  };
  gjs?: {
    owner?: unknown;
  };
  gmd?: {
    scope?: Record<string, unknown>;
    remarkPlugins?: unknown[];
    rehypePlugins?: unknown[];
  };
}

/**
 * Standard for the REPL, not real apps.
 * HBS isn't used in real apps (that are fully up to date)
 */
const standardScope = {
  // These are only added here because it's convenient for hbs
  // to have them
  array,
  concat,
  fn,
  get,
  hash,
  on,
  // The default available scope for gjs:
  //
  // We don't use gjs transpilation here, because hbs transpilation
  // doesn't need to go through the babel infra, so it's faster this way,
  // even though it's more "verbose" and could get out of sync from the
  // implementations / source-of-truth.
  //
  // https://github.com/emberjs/babel-plugin-ember-template-compilation/blob/main/src/scope-locals.ts#L16
  //
  // ////////////////
  // namespaces
  // ////////////////
  //   TC39
  globalThis,
  Atomics,
  JSON,
  Math,
  Reflect,
  //   WHATWG
  localStorage,
  sessionStorage,
  URL,
  // ////////////////
  // functions / utilities
  // ////////////////
  //   TC39
  isNaN,
  isFinite,
  parseInt,
  parseFloat,
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
  //   WHATWG
  postMessage,
  structuredClone,
  // ////////////////
  // new-less Constructors (still functions)
  // ////////////////
  //   TC39
  Array, // different behavior from (array)
  BigInt,
  Boolean,
  Date,
  Number,
  Object, // different behavior from (hash)
  String,
  // ////////////////
  // Values
  // ////////////////
  //   TC39
  Infinity,
  NaN,
  //   WHATWG
  isSecureContext,
};

export default class CompilerService {
  #compiler: Compiler | undefined;

  constructor() {
    const global = getGlobal();

    global.REPL ||= {};

    if (global.REPL.compiler) {
      return global.REPL.compiler;
    }

    global.REPL.compiler = this;

    registerDestructor(this, () => {
      delete global.REPL?.compiler;
    });
  }

  @tracked messages: Message[] = [];

  get lastInfo(): InfoMessage | undefined {
    const m = this.messages;

    for (let i = m.length - 1; i >= 0; i--) {
      const current = m[i];

      if (current?.type === 'info') return current;
    }
  }

  get lastError(): ErrorMessage | undefined {
    const m = this.messages;

    for (let i = m.length - 1; i >= 0; i--) {
      const current = m[i];

      if (current?.type === 'error') return current;
    }
  }

  /**
   * @param {ModuleMap} [ extraModules ]: map of import paths to modules.
   *  These modules are useful if you need to document a library or a any design system or a styleguide or
   *  if there are additional modules that could be imported in the passed `code`.
   * @param {object} [options] optional compiler options for each format/flavor
   *
   *  Later on, imports that are not present by default (ember/glimmer) or that
   *  are not provided by extraModules will be searched on npm to see if a package
   *  needs to be downloaded before running the `code` / invoking the component
   */
  setup = (extraModules: ModuleMap = {}, options: CompilerOptions = {}) => {
    const localModules = modules(extraModules);

    this.#compiler = new Compiler({
      logging: location.search.includes('debug'),
      resolve: {
        ...localModules,
      },
      on: {
        log: (type: Message['type'], message: string) => {
          this.messages.push({ type, message });
          // Waiting on better array primitive
          // eslint-disable-next-line no-self-assign
          this.messages = this.messages;
        },
      },
      options: {
        ...options,
        gjs: {
          owner: {
            name: 'empty default owner',
            lookup: () => {},
            resolveRegistration: () => {},
          },
          ...(options.gjs ?? {}),
        },
        gmd: {
          ...(options.gmd ?? {}),
          scope: {
            ...standardScope,
            ...(options.gmd?.scope ?? {}),
          },
          remarkPlugins: [
            function defaultHbsToEmber() {
              return function transformer(tree: any) {
                visit(tree, 'code', (node) => {
                  if (node.lang === 'hbs') {
                    if (!node.meta) {
                      node.meta = 'ember';
                    } else {
                      node.meta += ' ember';
                    }

                    return node;
                  }
                });

                return tree;
              };
            },
            ...(options.gmd?.remarkPlugins ?? []),
          ],
        },
        hbs: {
          ember: {
            ...(options.hbs ?? {}),
            scope: {
              ...standardScope,
              ...(options.hbs?.scope ?? {}),
            },
          },
        },
      },
    });
  };

  get compiler(): Compiler {
    /**
     * This is useful for our own testing.
     * not sure if this would be a footgun for consumers' usage
     */
    if (!this.#compiler) {
      this.setup();
    }

    assert(
      `Expected a compiled to be setup on the compiler service. Use \`compiler.setup()\` first.`,
      this.#compiler
    );

    return this.#compiler;
  }

  async createEditor(
    element: HTMLElement,
    options: {
      text: string | null | undefined;
      format: string;
      handleUpdate: (text: string) => void;
      extensions?: unknown[];
    }
  ): Promise<{
    view: EditorView;
    setText: (text: string, format: string) => Promise<void>;
    setFormat: (format: string) => Promise<void>;
  }> {
    return this.compiler.createEditor(element, options);
  }

  async #compile(ext: string, text: string, options?: Record<string, unknown>) {
    /**
     * Protect from accidental backtracking-render assertions
     * (infinite loop protection)
     *
     * This function doesn't ready any tracked data, so we don't need to
     * worry about invalidation or anything.
     */
    await Promise.resolve();

    this.messages = [];

    return this.compiler.compile(ext, text, options ?? {});
  }

  /**
   * @public
   *
   * Defers to the underlying repl-SDK and gives us a component we can render.
   *
   * @param {string} ext the ext/format to be compiled
   * @param {string} text the code to be compiled using the configured compiler for the ext
   */
  @waitFor
  async compile(ext: string, text: string, options?: Record<string, unknown>) {
    const name = nameFor(text);
    let component: undefined | ComponentLike;
    let error: undefined | Error;

    try {
      if (ext === 'hbs') {
        /**
         * Are there other hbs-using frameworks?
         */
        options ||= {};
        options.flavor = 'ember';
      }

      const result = await this.#compile(ext, text, options);

      component = rendersElement(result);
    } catch (e) {
      // Put a breakpoint here to debug
      // debugger;
      console.error(e);
      error = e as Error | undefined;
    }

    return { name, component, error };
  }

  /**
   * @public
   *
   * Transpiles GlimmerJS (*.gjs) formatted text into and evaluates as a JS Module.
   * The returned component can be invoked explicitly in the consuming project.
   *
   * @param {string} code the code to be compiled
   */
  compileGJS(code: string): Promise<CompileResult> {
    return this.compile('gjs', code);
  }

  /**
   * compile a template with an empty scope
   * to use components, helpers, etc, you will need to compile with JS
   *
   * (templates alone do not have a way to import / define complex structures)
   */
  @waitFor
  async compileHBS(
    source: string,
    options: {
      /**
       * Used for debug viewing
       */
      moduleName?: string;
      /**
       * Additional values to include in hbs scope.
       * This is a _strict mode_ hbs component.
       */
      scope?: Record<string, unknown>;
    } = {}
  ): Promise<CompileResult> {
    return this.compile('hbs', source, options);
  }

  @waitFor
  compileMD(
    source: string,
    options?: {
      remarkPlugins?: unknown[];
      rehypePlugins?: unknown[];
    }
  ): Promise<CompileResult> {
    return this.compile('md', source, options);
  }
}

function getGlobal() {
  return globalThis as {
    REPL?: {
      compiler?: CompilerService;
    };
  };
}
