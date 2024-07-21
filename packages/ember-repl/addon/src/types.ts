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

interface Events {
  onSuccess: (component: ComponentLike) => Promise<unknown> | unknown;
  onError: (error: string) => Promise<unknown> | unknown;
  onCompileStart: () => Promise<unknown> | unknown;
}

interface Scope {
  importMap?: EvalImportMap;
}

export type Format = 'glimdown' | 'gjs' | 'hbs';
export const SUPPORTED_FORMATS = ['glimdown', 'gjs', 'hbs'];

export interface GlimdownOptions extends Scope, Events {
  format: 'glimdown';
  remarkPlugins?: UnifiedPlugin[];
  rehypePlugins?: UnifiedPlugin[];
  CopyComponent?: string;
  ShadowComponent?: string;
  topLevelScope?: ScopeMap;
}
export interface GJSOptions extends Scope, Events {
  format: 'gjs';

  // Make overloads easier?
  remarkPlugins?: never;
  rehypePlugins?: never;
  CopyComponent?: never;
  ShadowComponent?: never;
}

export interface HBSOptions extends Scope, Events {
  format: 'hbs';
  topLevelScope?: ScopeMap;

  // Make overloads easier?
  remarkPlugins?: never;
  rehypePlugins?: never;
  CopyComponent?: never;
  ShadowComponent?: never;
}
