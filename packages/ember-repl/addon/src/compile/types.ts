import type { ComponentLike } from '@glint/template';
import type { Pluggable } from 'unified';

export type Input = string | undefined | null;
export type Format = 'glimdown' | 'md' | 'vue' | 'svelte' | 'gjs' | 'hbs' | 'mermaid' | 'react';

export interface EvalImportMap {
  [moduleName: string]: ScopeMap;
}

export interface ScopeMap {
  [localName: string]: unknown;
}

export interface ModuleMap {
  [key: string]: () => Promise<unknown> | Record<string, unknown>;
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
