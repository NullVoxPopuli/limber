import { CACHE } from '../compile/compile.ts';
import { setup } from '../setup.ts';

import type { ModuleMap } from '../compile/types';
import type { Options } from 'repl-sdk';

export function clearCompileCache() {
  CACHE.clear();
}

type Hooks = {
  beforeEach: (callback: (...args: unknown[]) => void | Promise<void>) => void | Promise<void>;
  afterEach: (callback: (...args: unknown[]) => void | Promise<void>) => void | Promise<void>;
};

export function setupCompiler(
  hooks: Hooks,
  options?: {
    modules?: ModuleMap;
    /**
     * Clearl all the compile caches between tests.
     * This is false by default, so that tests run faster, and
     * we thrash the network less.
     */
    clearCache?: true;
    options?: Options['options'];
  }
) {
  hooks.beforeEach(function (this: object) {
    if (options?.clearCache) {
      clearCompileCache();
    }

    setup(this, options);
  });

  hooks.afterEach(function () {
    if (options?.clearCache) {
      clearCompileCache();
    }
  });
}
