import { CACHE } from '../compile/compile.ts';
import { setup } from '../setup.ts';

import type { ModuleMap } from '../compile/types';
import type { Options } from 'repl-sdk';

export function clearCompileCache() {
  CACHE.clear();
}

export function setupCompiler(
  hooks: {
    beforeEach: (callback: (...args: unknown[]) => void | Promise<void>) => void | Promise<void>;
    afterEach: (callback: (...args: unknown[]) => void | Promise<void>) => void | Promise<void>;
  },
  options?: { modules?: ModuleMap; options?: Options['options'] }
) {
  hooks.beforeEach(function (this: object) {
    clearCompileCache();
    setup(this, options);
  });

  hooks.afterEach(function () {
    clearCompileCache();
  });
}
