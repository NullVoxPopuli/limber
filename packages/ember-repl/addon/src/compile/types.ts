import type { ComponentLike } from '@glint/template';
import type { unified } from 'unified';

export interface EvalImportMap {
  [moduleName: string]: ScopeMap;
}

export interface ScopeMap {
  [localName: string]: unknown;
}

export type UnifiedPlugin = Parameters<ReturnType<typeof unified>['use']>[0];

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
