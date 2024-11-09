/* eslint-disable @typescript-eslint/no-explicit-any */
// import { precompileJSON } from '@glimmer/compiler';
import { array, concat, fn, get, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { template } from '@ember/template-compiler/runtime';

import { nameFor } from '../utils.ts';

import type { CompileResult } from '../types.ts';
import type { ComponentLike } from '@glint/template';

/**
 * compile a template with an empty scope
 * to use components, helpers, etc, you will need to compile with JS
 *
 * (templates alone do not have a way to import / define complex structures)
 */
export function compileHBS(code: string, options: CompileTemplateOptions = {}): CompileResult {
  let name = nameFor(code);
  let component: undefined | ComponentLike;
  let error: undefined | Error;

  try {
    component = template(code, {
      moduleName: options.moduleName || name,
      scope: () => ({ on, hash, array, concat, fn, get }),
    });
  } catch (e) {
    error = e as Error | undefined;
  }

  return { name, component, error };
}

interface CompileTemplateOptions {
  /**
   * Used for debug viewing
   */
  moduleName?: string;
  scope?: Record<string, unknown>;
}
