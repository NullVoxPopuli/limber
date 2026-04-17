import { assert } from '@ember/debug';

import { resource, resourceFactory } from 'ember-resources';

import { getCompiler } from '../services/compiler.ts';
import { compile } from './compile.ts';

import type { CompileState } from './state.ts';
import type { Format, Input } from './types.ts';

export interface CompiledOptions {
  /**
   * Arguments forwarded to the compiled component.
   *
   * Pass a stable object reference whose property values are reactive
   * (e.g. a `TrackedObject` or a plain object with getters reading
   * `@tracked` state). Property updates propagate to the rendered
   * component without triggering a recompile.
   *
   * Keys must be present when compilation happens — additional keys
   * added later will not become reactive.
   */
  args?: Record<string, unknown>;
}

export function Compiled(markdownText: Input | (() => Input)): CompileState;
export function Compiled(
  markdownText: Input | (() => Input),
  format?: Format,
  flavor?: string
): CompileState;
export function Compiled(
  markdownText: Input | (() => Input),
  format: () => Format
): CompileState;
export function Compiled(
  markdownText: Input | (() => Input),
  format: () => Format,
  flavor: () => string
): CompileState;
export function Compiled(
  markdownText: Input | (() => Input),
  format?: Format | (() => Format),
  flavor?: string | (() => string),
  options?: CompiledOptions
): CompileState;

/**
 * By default, this compiles to `glimdown`. A Markdown format which
 * extracts `live` tagged code snippets and compiles them to components.
 *
 * The optional fourth argument may specify `args` to forward to the
 * compiled component — see `CompiledOptions`.
 */
export function Compiled(
  markdownText: Input | (() => Input),
  maybeFormat?: Format | (() => Format),
  maybeFlavor?: string | (() => string),
  maybeOptions?: CompiledOptions
): CompileState {
  return resource(({ owner }) => {
    const input =
      typeof markdownText === 'function' ? markdownText() : markdownText;
    const format =
      typeof maybeFormat === 'function'
        ? maybeFormat()
        : maybeFormat || 'glimdown';
    let flavor =
      typeof maybeFlavor === 'function' ? maybeFlavor() : maybeFlavor;

    flavor = typeof flavor === 'string' ? flavor : undefined;

    assert(
      `second parameter to Compiled must be a format or function that returns a format`,
      typeof format === 'string'
    );

    const compiler = getCompiler(owner);

    return compile(compiler, input, {
      format,
      flavor,
      args: maybeOptions?.args,
    });
  });
}

resourceFactory(Compiled);
