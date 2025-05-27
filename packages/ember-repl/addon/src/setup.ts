import { getOwner } from '@ember/owner';

import type { ModuleMap } from './compile/types.ts';
import type CompilerService from './services/compiler.ts';

export function setup(context: object, options?: { modules: ModuleMap }) {
  const compiler = getOwner(context)?.lookup('service:compiler') as CompilerService;

  compiler.setup(options?.modules ?? {});
}
