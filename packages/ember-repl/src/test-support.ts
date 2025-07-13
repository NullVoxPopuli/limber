import { Compiler } from 'repl-sdk';

import { CACHE } from './compile/compile.ts';
import { setup } from './setup.ts';

import type { ModuleMap } from './compile/types.ts';
import type { TestContext } from '@ember/test-helpers';
import type { Options } from 'repl-sdk';

export function clearCompileCache() {
  CACHE.clear();
}

type Hooks = {
  beforeEach: (
    this: object,
    callback: (...args: unknown[]) => void | Promise<void>
  ) => void | Promise<void>;
  afterEach: (
    this: object,
    callback: (...args: unknown[]) => void | Promise<void>
  ) => void | Promise<void>;
};

export function clearCache(hooks: Hooks) {
  hooks.beforeEach(function (this: TestContext) {
    Compiler.clearCache();
  });
  hooks.afterEach(function (this: TestContext) {
    Compiler.clearCache();
  });
}

export function setupCompiler(
  hooks: Hooks,
  options?: {
    modules?: ModuleMap;
    /**
     * Clear all the compile caches between tests.
     * This is false by default, so that tests run faster, and
     * we thrash the network less.
     */
    clearCache?: true;
    options?: Options['options'];
  }
) {
  hooks.beforeEach(function (this: TestContext) {
    Compiler.clearCache();

    if (options?.clearCache) {
      clearCompileCache();
    }

    setup(this, options);
  });

  hooks.afterEach(function (this: TestContext) {
    Compiler.clearCache();

    if (options?.clearCache) {
      clearCompileCache();
    }
  });
}
