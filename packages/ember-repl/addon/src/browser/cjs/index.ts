import { preprocess, transform } from '../gjs';
import { nameFor } from '../utils';
import { evalSnippet } from './eval';

import type { ExtraModules } from '../types';

export interface Info {
  code: string;
  name: string;
}

export async function compileJS(code: string, extraModules?: ExtraModules) {
  let name = nameFor(code);
  let component: undefined | unknown;
  let error: undefined | Error;

  try {
    let compiled = await compileGJS({ code: code, name });

    if (!compiled) {
      throw new Error(`Compiled output is missing`);
    }

    component = evalSnippet(compiled, extraModules).default;
  } catch (e) {
    error = e as Error | undefined;
  }

  return { name, component, error };
}

async function compileGJS({ code: input, name }: Info) {
  let preprocessed = preprocess(input, name);
  let result = await transform(preprocessed, name);

  if (!result) {
    return;
  }

  let { code } = result;

  return code;
}
