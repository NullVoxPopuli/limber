// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

import { Compiler } from 'repl-sdk';

import { nameFor } from '../compile/utils.ts';
import { modules } from './known-modules.ts';

import type { CompileResult, ModuleMap } from '../compile/types.ts';
import type Owner from '@ember/owner';
import type { ComponentLike } from '@glint/template';
import type { ErrorMessage, InfoMessage, Message } from 'repl-sdk';

function isOwner(context: object): context is Owner {
  return 'lookup' in context && 'register' in context;
}

/**
 * This service doesn't have custom teardown / destory behavior.
 * GC is sufficient.
 */
const serviceCache = new WeakMap<object, CompilerService>();

export function getCompiler(context: object) {
  const owner = isOwner(context) ? context : getOwner(context);

  assert(
    `Owner does not exist on passed context. Cannot look up the compiler service without an owner.`,
    owner
  );

  let existing = serviceCache.get(owner);

  if (existing) {
    return existing;
  }

  existing = new CompilerService();

  serviceCache.set(owner, existing);

  return existing;
}

/**
 * Old way to make static components, because
 * https://github.com/emberjs/ember.js/issues/20913
 *
 * The runtime compiler doesn't allow you to catch compiler errors.
 * This particular component doesn't need to be runtime anyway.
 */
function rendersElement(element: Element): ComponentLike {
  return setComponentTemplate(
    precompileTemplate(`{{element}}`, {
      strictMode: true,
      scope: () => ({ element }),
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
        gmd: {
          ...(options.gmd ?? {}),
          scope: {
            ...standardScope,
            ...(options.gmd?.scope ?? {}),
          },
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

  async #compile(ext: string, text: string, options?: Record<string, unknown>) {
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
      const element = await this.#compile(ext, text, options);

      component = rendersElement(element);
    } catch (e) {
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
    return this.compile('hbs', source, {
      ...options,
      /**
       * ember users don't want any other version of hbs
       */
      flavor: 'ember',
    });
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
