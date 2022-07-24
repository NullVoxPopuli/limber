import { compileHBS } from 'ember-repl';

import type { CompilationResult } from './types';

export async function compile(hbsInput: string): Promise<CompilationResult> {
  try {
    return await compileHBS(hbsInput);
  } catch (error) {
    return { error };
  }
}
