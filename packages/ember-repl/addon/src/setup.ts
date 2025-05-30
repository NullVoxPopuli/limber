import { assert } from '@ember/debug';
import { getOwner } from '@ember/owner';

import CompilerService from './services/compiler.ts';

import type { ModuleMap } from './compile/types.ts';

export function setup(
  context: object,
  options?: { modules?: ModuleMap; serviceName?: string }
): CompilerService {
  const name = options?.serviceName ?? 'compiler';
  const owner = getOwner(context);

  assert(
    `Could not find an Owner on the passed context. The owner needs to be passed so I can access the '${name}' service.`,
    owner
  );

  owner.register(`service:${name}`, CompilerService);

  let compiler = owner.lookup('service:compiler') as CompilerService;

  if (!compiler) {
    owner.register(`service:${name}`, CompilerService);
    compiler = owner.lookup('service:compiler') as CompilerService;
  }

  assert(`Could not find the compiler service. It should be registered as '${name}'.`, compiler);

  compiler.setup(options?.modules ?? {});

  return compiler;
}
