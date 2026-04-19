import { assert } from '@ember/debug';

import { resource, resourceFactory } from 'ember-resources';

import { getCompiler } from '../services/compiler.ts';
import { compile } from './compile.ts';

import type { CompileState } from './state.ts';
import type { Format, Input } from './types.ts';

export interface CompiledOptions {
  format?: Format;
  flavor?: string;
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
  options: CompiledOptions
): CompileState;
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

/**
 * By default, this compiles to `glimdown`. A Markdown format which
 * extracts `live` tagged code snippets and compiles them to components.
 *
 * Pass a `CompiledOptions` bag as the second argument to specify
 * `format`, `flavor`, and `args` forwarded to the rendered component.
 */
export function Compiled(
  markdownText: Input | (() => Input),
  maybeFormatOrOptions?: Format | (() => Format) | CompiledOptions,
  maybeFlavor?: string | (() => string)
): CompileState {
  return resource(({ owner }) => {
    const input =
      typeof markdownText === 'function' ? markdownText() : markdownText;

    let format: Format | undefined;
    let flavor: string | undefined;
    let args: Record<string, unknown> | undefined;

    if (typeof maybeFormatOrOptions === 'function') {
      format = maybeFormatOrOptions();
    } else if (typeof maybeFormatOrOptions === 'string') {
      format = maybeFormatOrOptions;
    } else if (maybeFormatOrOptions) {
      format = maybeFormatOrOptions.format;
      flavor = maybeFormatOrOptions.flavor;
      args = maybeFormatOrOptions.args;
    }

    format ??= 'glimdown';

    if (flavor === undefined) {
      const positional =
        typeof maybeFlavor === 'function' ? maybeFlavor() : maybeFlavor;

      flavor = typeof positional === 'string' ? positional : undefined;
    }

    assert(
      `second parameter to Compiled must be a format, an options bag, or a function that returns a format`,
      typeof format === 'string'
    );

    const compiler = getCompiler(owner);

    return compile(compiler, input, {
      format,
      flavor,
      args,
    });
  });
}

resourceFactory(Compiled);
