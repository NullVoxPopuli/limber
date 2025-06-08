import { CACHE } from '../compile/compile.ts';
import { setup } from '../setup.ts';

import type { ModuleMap } from '../compile/types';

export function clearCompileCache() {
  CACHE.clear();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (globalThis.importShim) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete globalThis.importShim;
  }
}

export function setupCompiler(
  hooks: {
    beforeEach: (callback: (...args: unknown[]) => void | Promise<void>) => void | Promise<void>;
    afterEach: (callback: (...args: unknown[]) => void | Promise<void>) => void | Promise<void>;
  },
  options?: { modules?: ModuleMap }
) {
  hooks.beforeEach(function (this: object) {
    clearCompileCache();
    setup(this, options);
  });

  hooks.afterEach(function () {
    clearCompileCache();
  });
}
