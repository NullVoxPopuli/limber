import { CACHE } from '../compile/compile.ts';
import { setup } from '../setup.ts';

import type { ModuleMap } from '../compile/types';

export function clearCompileCache() {
  CACHE.clear();
}

export function setupCompiler(
  hooks: {
    beforeEach: (callback: (...args: unknown[]) => void | Promise<void>) => void | Promise<void>;
  },
  options?: { modules?: ModuleMap }
) {
  hooks.beforeEach(function (this: object) {
    setup(this, options);
  });
}
