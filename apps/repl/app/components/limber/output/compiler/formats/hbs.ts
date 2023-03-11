import { compileHBS } from 'ember-repl';

import type { CompilationResult } from './types';

export async function compile(hbsInput: string): Promise<CompilationResult> {
  try {
    let { component, ...rest } = await compileHBS(hbsInput);

    return { ...rest, rootComponent: component };
  } catch (error) {
    return { error };
  }
}
