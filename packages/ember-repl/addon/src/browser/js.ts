import { compileJS as compileAMD } from './cjs';
import { compileJS as compileESM } from './esm';

import type { ExtraModules, Options } from './types';

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
export function compileJS(code: string, extraModules?: ExtraModules, options?: Options) {
  if (options?.skypack) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // if (!(window as any).webpackChunkDummy) {
    //   return {
    //     component: undefined,
    //     name: undefined,
    //     error: `Your environment is using AMD utilities -- using native ESM is not allowed unless the environment is also ESM`,
    //   };
    // }

    return compileESM(code, extraModules);
  }

  return compileAMD(code, extraModules);
}
