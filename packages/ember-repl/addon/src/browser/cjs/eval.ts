/* eslint-disable @typescript-eslint/no-unused-vars */
import { modules } from '../known-modules';

import type { ExtraModules } from '../types';
import type Component from '@glimmer/component';

const SECRET = Symbol('Secret secret (require)');

export function evalSnippet(
  compiled: string,
  extraModules: ExtraModules = {}
): {
  default: Component;
  services?: { [key: string]: unknown };
} {
  const exports = {};

  function require(moduleName: keyof typeof modules): unknown {
    let preConfigured = modules[moduleName] || extraModules[moduleName];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return preConfigured || window.require(moduleName);
  }

  // This ultimately doesn't matter, and it's never read from.
  // It's here because we don't want our custom require function to be optimized away.
  //
  // We also don't direct assign because we don't want minifiers to rename the function.
  // https://github.com/glimmerjs/glimmer-experimental/blob/master/packages/examples/playground/src/utils/eval-snippet.ts
  (window as any)[SECRET] = { require };

  eval(compiled);

  return exports as {
    default: Component;
    services?: { [key: string]: unknown };
  };
}
