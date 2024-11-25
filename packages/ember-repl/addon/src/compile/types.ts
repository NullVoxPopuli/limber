import type { ComponentLike } from '@glint/template';
import type { Pluggable } from 'unified';

export interface EvalImportMap {
  /**
   * The name of the module to import and the value that will be imported.
   * For example:
   * ```js
   * {
   *   'my-library': () => import('my-library'),
   * }
   * ```
   *
   * or, if you want to make a fake module, you may specify its exports
   * ```js
   * {
   *   'my-library': { Foo, Bar }
   * }
   * ```
   */
  [moduleName: string]: ScopeMap | (() => Promise<unknown>);
}

export interface ScopeMap {
  /**
   * Key-value pairs of values and their export names
   */
  [localName: string]: unknown;
}

export type UnifiedPlugin = Pluggable;

export interface CompileResult {
  component?: ComponentLike;
  error?: Error;
  name: string;
}

export type Options = {
  /**
   * @internal
   * @deprecated do not use - not under semver
   */
  skypack?: boolean;
};
