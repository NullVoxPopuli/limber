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
export function compileHBS(source: string, options: CompileTemplateOptions = {}): CompileResult {
  const name = nameFor(source);
  let component: undefined | ComponentLike;
  let error: undefined | Error;

  try {
    component = template(source, {
      scope: () => ({ array, concat, fn, get, hash, on, ...(options?.scope ?? {}) }),
    }) as unknown as ComponentLike;
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
