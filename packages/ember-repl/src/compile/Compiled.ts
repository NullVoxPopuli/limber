import { assert } from '@ember/debug';

import { resource, resourceFactory } from 'ember-resources';

import { getCompiler } from '../services/compiler.ts';
import { compile } from './compile.ts';

import type { CompileState } from './state.ts';
import type { Format, Input } from './types.ts';

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

/**
 * By default, this compiles to `glimdown`. A Markdown format which
 * extracts `live` tagged code snippets and compiles them to components.
 */
export function Compiled(
  markdownText: Input | (() => Input),
  maybeFormat?: Format | (() => Format),
  maybeFlavor?: string | (() => string)
): CompileState {
  return resource(({ owner }) => {
    const input =
      typeof markdownText === 'function' ? markdownText() : markdownText;
    const format =
      typeof maybeFormat === 'function'
        ? maybeFormat()
        : maybeFormat || 'glimdown';
    const flavor =
      typeof maybeFlavor === 'function' ? maybeFlavor() : maybeFlavor;

    console.log({ input, format, flavor, maybeFormat, maybeFlavor });
    assert(
      `second parameter to Compiled must be a format or function that returns a format`,
      typeof format === 'string'
    );
    assert(
      `third parameter to Compiled must be a format-flavor (such as "react" for jsx-formats), or undefined`,
      flavor === undefined || typeof flavor === 'string'
    );

    const compiler = getCompiler(owner);

    return compile(compiler, input, {
      format,
      flavor,
    });
  });
}

resourceFactory(Compiled);
