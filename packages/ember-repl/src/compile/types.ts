import type { ComponentLike } from '@glint/template';

export type Input = string | undefined | null;
export type Format =
  | 'glimdown'
  | 'jsx'
  | 'md'
  | 'vue'
  | 'svelte'
  | 'gjs'
  | 'hbs'
  | 'mermaid'
  | 'react';

export interface ScopeMap {
  [localName: string]: unknown;
}

export interface ModuleMap {
  [key: string]: () => Promise<unknown> | Record<string, unknown>;
}

export interface CompileResult {
  component?: ComponentLike;
  error?: Error;
  name: string;
}
