// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';
import { assert } from '@ember/debug';
import { array, concat, fn, get, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { getOwner } from '@ember/owner';
import Service from '@ember/service';
import { precompileTemplate } from '@ember/template-compilation';
import { template } from '@ember/template-compiler/runtime';
import { waitFor } from '@ember/test-waiters';

import { Compiler } from 'repl-sdk';

import { nameFor } from '../compile/utils.ts';
import { modules } from './known-modules.ts';

import type { CompileResult, ModuleMap } from '../compile/types.ts';
import type Owner from '@ember/owner';
import type { ComponentLike } from '@glint/template';

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

export default class CompilerService extends Service {
  #compiler: Compiler | undefined;

  /**
   * @param {ModuleMap} [ extraModules ]: map of import paths to modules.
   *  These modules are useful if you need to document a library or a any design system or a styleguide or
   *  if there are additional modules that could be imported in the passed `code`.
   *
   *  Later on, imports that are not present by default (ember/glimmer) or that
   *  are not provided by extraModules will be searched on npm to see if a package
   *  needs to be downloaded before running the `code` / invoking the component
   */
  setup = (extraModules: ModuleMap = {}) => {
    const localModules = modules(extraModules);

    this.#compiler = new Compiler({
      logging: location.search.includes('debug'),
      resolve: {
        ...localModules,
      },
    });
  };

  get compiler() {
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

  async #compile(ext: string, text: string) {
    return this.compiler.compile(ext, text);
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
  async compile(ext: string, text: string) {
    const name = nameFor(text);
    let component: undefined | ComponentLike;
    let error: undefined | Error;

    try {
      const element = await this.#compile(ext, text);

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
  @waitFor
  async compileGJS(code: string): Promise<CompileResult> {
    const name = nameFor(code);
    let component: undefined | ComponentLike;
    let error: undefined | Error;

    try {
      const element = await this.#compile('gjs', code);

      component = rendersElement(element);
    } catch (e) {
      console.error(e);
      error = e as Error | undefined;
    }

    return { name, component, error };
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
    const name = nameFor(source);
    let component: undefined | ComponentLike;
    let error: undefined | Error;

    try {
      await Promise.resolve();
      component = template(source, {
        scope: () => ({ array, concat, fn, get, hash, on, ...(options?.scope ?? {}) }),
      }) as unknown as ComponentLike;
    } catch (e) {
      error = e as Error | undefined;
    }

    return { name, component, error };
  }

  @waitFor
  async compileMD(source: string): Promise<CompileResult> {
    const name = nameFor(source);
    let component: undefined | ComponentLike;
    let error: undefined | Error;

    try {
      const element = await this.#compile('md', source);

      component = rendersElement(element);
    } catch (e) {
      console.error(e);
      error = e as Error | undefined;
    }

    return { name, component, error };
  }
}
