import { assert } from '@ember/debug';

import { getCompiler } from './services/compiler.ts';

import type { ModuleMap } from './compile/types.ts';
import type CompilerService from './services/compiler.ts';

export function setup(
  context: object,
  options?: { modules?: ModuleMap; options?: object }
): CompilerService {
  const compiler = getCompiler(context);

  assert(`Could not find the compiler service.`, compiler);

  compiler.setup(options?.modules ?? {}, options?.options);

  return compiler;
}
