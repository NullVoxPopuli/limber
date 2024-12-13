import { assert } from '@ember/debug';

import { cell, resource, resourceFactory } from 'ember-resources';

import Compiler from './services/ember-repl/compiler.ts';

import type { EvalImportMap, Format, ScopeMap, UnifiedPlugin } from '../types.ts';
import type { ComponentLike } from '@glint/template';

export const CACHE = new Map<string, ComponentLike>();

type Input = string | undefined | null;

type ExtraOptions =
  | {
      format: 'glimdown';
      remarkPlugins?: UnifiedPlugin[];
      rehypePlugins?: UnifiedPlugin[];
      importMap?: EvalImportMap;
      CopyComponent?: string;
      ShadowComponent?: string;
      topLevelScope?: ScopeMap;
    }
  | {
      format: 'hbs';
      topLevelScope?: ScopeMap;
    }
  | {
      format: 'gjs';
      importMap?: EvalImportMap;
    };

/**
 * @internal
 */
export interface Value {
  isReady: boolean;
  error: string | null;
  component: ComponentLike;
}

export function Compiled(markdownText: Input | (() => Input)): Value;
export function Compiled(markdownText: Input | (() => Input), options?: Format): Value;
export function Compiled(markdownText: Input | (() => Input), options?: () => Format): Value;
export function Compiled(markdownText: Input | (() => Input), options?: ExtraOptions): Value;
export function Compiled(markdownText: Input | (() => Input), options?: () => ExtraOptions): Value;

/**
 * By default, this compiles to `glimdown`. A Markdown format which
 * extracts `live` tagged code snippets and compiles them to components.
 */
export function Compiled(
  markdownText: Input | (() => Input),
  maybeOptions?: Format | (() => Format) | ExtraOptions | (() => ExtraOptions)
): Value {
  return resource(({ owner }) => {
    let maybeObject = typeof maybeOptions === 'function' ? maybeOptions() : maybeOptions;
    let format =
      (typeof maybeObject === 'string' ? maybeObject : maybeObject?.format) || 'glimdown';
    let options = (typeof maybeObject === 'string' ? {} : maybeObject) || {};

    let input = typeof markdownText === 'function' ? markdownText() : markdownText;
    let ready = cell(false);
    let error = cell<string | null>();
    let result = cell<ComponentLike>();

    let compiler = owner.lookup('service:ember-repl/compiler');

    assert(`Expected to find the compiler service at 'ember-repl/compiler'`, compiler);
    assert(
      `Expcected the service at 'ember-repl/compiler' to be an instance of the Compiler Service`,
      compiler instanceof Compiler
    );

    if (input) {
      compiler.compile(input, {
        // narrowing is hard here, but this is an implementation detail
        format: format as any,
        onSuccess: async (component) => {
          result.current = component;
          ready.set(true);
          error.set(null);
        },
        onError: async (e) => {
          error.set(e);
        },
        onCompileStart: async () => {
          ready.set(false);
        },
        ...options,
      });
    }

    return () => ({
      isReady: ready.current,
      error: error.current,
      component: result.current,
    });
  });
}

resourceFactory(Compiled);
