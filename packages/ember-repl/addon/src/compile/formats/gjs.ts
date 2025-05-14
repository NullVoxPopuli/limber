// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { template } from '@ember/template-compiler/runtime';

import { Compiler } from 'repl-sdk';

import { nameFor } from '../utils.ts';
import { modules } from './known-modules.ts';

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
      ...modules,
      ...extraModules,
      'ember-source/dist/ember-template-compiler': import(
        // @ts-ignore
        'ember-source/dist/ember-template-compiler.js'
      ),
      '@babel/standalone': import('@babel/standalone'),
      'content-tag': import('content-tag'),
      'decorator-transforms': import('decorator-transforms'),
      'decorator-transforms/runtime': import('decorator-transforms/runtime'),
      'babel-plugin-ember-template-compilation': import('babel-plugin-ember-template-compilation'),
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
