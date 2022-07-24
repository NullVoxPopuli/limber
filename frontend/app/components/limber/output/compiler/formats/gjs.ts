import { compileJS } from 'ember-repl';

import type { CompilationResult } from './types';

export async function compile(gjsInput: string): Promise<CompilationResult> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let { COMPONENT_MAP } = await import('/ember-repl/component-map.js');

  try {
    let { component, ...rest } = await compileJS(gjsInput, COMPONENT_MAP);

    return { ...rest, rootComponent: component };
  } catch (error) {
    return { error };
  }
}
