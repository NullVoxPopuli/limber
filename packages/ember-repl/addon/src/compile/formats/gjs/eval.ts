/* eslint-disable @typescript-eslint/no-unused-vars */
import { modules } from './known-modules.ts';

import type Component from '@glimmer/component';

export function evalSnippet(
  compiled: string,
  extraModules: Record<string, unknown /* imported module */> = {}
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

  // https://github.com/glimmerjs/glimmer-experimental/blob/master/packages/examples/playground/src/utils/eval-snippet.ts
  eval(compiled);

  return Object.assign(exports, { require }) as {
    default: Component;
    services?: { [key: string]: unknown };
    require: unknown;
  };
}
