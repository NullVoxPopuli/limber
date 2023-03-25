/* eslint-disable @typescript-eslint/no-unused-vars */
import { modules } from '../known-modules';

import type Component from '@glimmer/component';
import type { ExtraModules } from 'ember-repl/types';

export function evalSnippet(
  compiled: string,
  extraModules: ExtraModules = {}
): {
  default: Component;
  services?: { [key: string]: unknown };
} {
  const exports = {};

  // https://github.com/glimmerjs/glimmer-experimental/blob/master/packages/examples/playground/src/utils/eval-snippet.ts
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  function require(moduleName: keyof typeof modules): unknown {
    let preConfigured = modules[moduleName] || extraModules[moduleName];

    return preConfigured || window.require(moduleName);
  }

  eval(compiled);

  return exports as { default: Component; services?: { [key: string]: unknown } };
}
