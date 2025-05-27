// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { assert } from '@ember/debug';
import { array, concat, fn, get, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import Service from '@ember/service';
import { template } from '@ember/template-compiler/runtime';

import { Compiler } from 'repl-sdk';

import { compile } from '../compile/index.ts';
import { nameFor } from '../compile/utils.ts';

import type { CompileResult, ModuleMap } from '../compile/types.ts';
import type { ComponentLike } from '@glint/template';
import { modules } from './known-modules.ts';

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
      logging: true,
      resolve: {
        ...localModules,
      },
    });
  };

  get compiler() {
    assert(
      `Expected a compiled to be setup on the compiler service. Use \`compiler.setup()\` first.`,
      this.#compiler
    );

    return this.#compiler;
  }

  async compile(ext: string, text: string) {
    return this.compiler.compile(ext, text);
  }

  /**
   * @public
   *
   * Transpiles GlimmerJS (*.gjs) formatted text into and evaluates as a JS Module.
   * The returned component can be invoked explicitly in the consuming project.
   *
   * @param {string} code the code to be compiled
   */
  async compileGJS(code: string): Promise<CompileResult> {
    const name = nameFor(code);
    let component: undefined | ComponentLike;
    let error: undefined | Error;

    try {
      const element = await this.compile('gjs', code);

      component = template(`{{element}}`, {
        scope: () => ({ element }),
      }) as unknown as ComponentLike;
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

  async compileMD(source: string): Promise<CompileResult> {
    const name = nameFor(source);
    let component: undefined | ComponentLike;
    let error: undefined | Error;
    /**
     * TODO: move this Compiler to a service
     */

    try {
      const element = await this.compile('md', source);

      component = template(`{{element}}`, {
        scope: () => ({ element }),
      }) as unknown as ComponentLike;
    } catch (e) {
      console.error(e);
      error = e as Error | undefined;
    }

    return { name, component, error };
  }

  async configuredCompile(text: string, options: any) {
    return compile(this, text, options);
  }
}
