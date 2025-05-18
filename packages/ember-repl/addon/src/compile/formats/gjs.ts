// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { template } from '@ember/template-compiler/runtime';

import { Compiler } from 'repl-sdk';

import { nameFor } from '../utils.ts';

import type { CompileResult } from '../types.ts';
import type { ComponentLike } from '@glint/template';

export interface Info {
  code: string;
  name: string;
}

/**
 * @public
 * Transpiles GlimmerJS (*.gjs) formatted text into and evaluates as a JS Module.
 * The returned component can be invoked explicitly in the consuming project.
 *
 * SEE: README for example usage
 *
 * @param {string} code: the code to be compiled
 * @param {Object} extraModules: map of import paths to modules. This isn't needed
 *  for classic ember projects, but for strict static ember projects, extraModules
 *  will need to be pasesd if compileJS is intended to be used in a styleguide or
 *  if there are additional modules that could be imported in the passed `code`.
 *
 *  Later on, imports that are not present by default (ember/glimmer) or that
 *  are not provided by extraModules will be searched on npm to see if a package
 *  needs to be downloaded before running the `code` / invoking the component
 */
export async function compileJS(
  code: string,
  extraModules?: Record<string, unknown>
): Promise<CompileResult> {
  const name = nameFor(code);
  let component: undefined | ComponentLike;
  let error: undefined | Error;
  /**
   * TODO: move this Compiler to a service
   */
  const compiler = new Compiler({
    logging: true,
    resolve: {
      /////////////////////////////
      // Provided by the framework
      /////////////////////////////
      '@ember/application': () => import('@ember/application'),
      '@ember/application/instance': () => import('@ember/application/instance'),
      '@ember/array': () => import('@ember/array'),
      '@ember/component': () => import('@ember/component'),
      '@ember/component/helper': () => import('@ember/component/helper'),
      '@ember/component/template-only': () => import('@ember/component/template-only'),
      '@ember/debug': () => import('@ember/debug'),
      '@ember/destroyable': () => import('@ember/destroyable'),
      '@ember/helper': () => import('@ember/helper'),
      '@ember/modifier': () => import('@ember/modifier'),
      '@ember/object': () => import('@ember/object'),
      '@ember/routing': () => import('@ember/routing'),
      '@ember/routing/route': () => import('@ember/routing/route'),
      '@ember/routing/router': () => import('@ember/routing/router'),
      '@ember/runloop': () => import('@ember/runloop'),
      '@ember/service': () => import('@ember/service'),
      '@ember/template-factory': () => import('@ember/template-factory'),
      '@ember/utils': () => import('@ember/utils'),
      '@ember/template': () => import('@ember/template'),
      '@ember/owner': () => import('@ember/owner'),
      '@glimmer/component': () => import('@glimmer/component'),
      '@glimmer/tracking': () => import('@glimmer/tracking'),
      'ember-resolver': () => import('ember-resolver');
      /////////////////////////////
      // Provided by the user (optional)
      /////////////////////////////
      ...extraModules,
      /////////////////////////////
      // Required for compilation (in addition to (some of) the framework deps
      /////////////////////////////
      'ember-source/dist/ember-template-compiler': () =>
        import(
          // eslint-disable-next-line
          // @ts-ignore
          'ember-source/dist/ember-template-compiler.js'
        ),
      'ember-source/dist/ember-template-compiler.js': () =>
        import(
          // eslint-disable-next-line
          // @ts-ignore
          'ember-source/dist/ember-template-compiler.js'
        ),
      // Direct Dependencies
      // '@babel/standalone': import('@babel/standalone'),
      'content-tag': () => import('content-tag'),
      'decorator-transforms': () => import('decorator-transforms'),
      'decorator-transforms/runtime': () => import('decorator-transforms/runtime'),
      'babel-plugin-ember-template-compilation': () =>
        import('babel-plugin-ember-template-compilation'),
      // Dependencies of the above
      'babel-import-util': () => import('babel-import-util'),
      // eslint-disable-next-line
      // @ts-ignore
      'babel-plugin-debug-macros': () => import('babel-plugin-debug-macros'),
    },
  });

  try {
    // Does this work?
    const element = await compiler.compile('gjs', code);

    component = template(`{{element}}`, { scope: () => ({ element }) }) as unknown as ComponentLike;
  } catch (e) {
    error = e as Error | undefined;
  }

  return { name, component, error };
}
