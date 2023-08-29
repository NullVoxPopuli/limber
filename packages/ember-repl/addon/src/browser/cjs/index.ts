import { preprocess, transform } from '../gjs.ts';
import { nameFor } from '../utils.ts';
import { evalSnippet } from './eval.ts';

import type { CompileResult, ExtraModules } from '../types.ts';
import type { ComponentLike } from '@glint/template';

export interface Info {
  code: string;
  name: string;
}

export async function compileJS(code: string, extraModules?: ExtraModules): Promise<CompileResult> {
  let name = nameFor(code);
  let component: undefined | ComponentLike;
  let error: undefined | Error;

  try {
    let compiled = await compileGJS({ code: code, name });

    if (!compiled) {
      throw new Error(`Compiled output is missing`);
    }

    component = evalSnippet(compiled, extraModules).default as unknown as ComponentLike;
  } catch (e) {
    error = e as Error | undefined;
  }

  return { name, component, error };
}

async function compileGJS({ code: input, name }: Info) {
  let preprocessed = await preprocess(input, name);
  let result = await transform(preprocessed, name);

  if (!result) {
    return;
  }

  let { code } = result;

  return code;
}
