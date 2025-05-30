import { resource, resourceFactory } from 'ember-resources';

import { getCompiler } from '../services/compiler.ts';
import { compile } from './compile.ts';

import type { CompileState } from './state.ts';
import type { Format, Input } from './types.ts';

export function Compiled(markdownText: Input | (() => Input)): CompileState;
export function Compiled(markdownText: Input | (() => Input), options?: Format): CompileState;
export function Compiled(markdownText: Input | (() => Input), options?: () => Format): CompileState;

/**
 * By default, this compiles to `glimdown`. A Markdown format which
 * extracts `live` tagged code snippets and compiles them to components.
 */
export function Compiled(
  markdownText: Input | (() => Input),
  maybeFormat?: Format | (() => Format)
): CompileState {
  return resource(({ owner }) => {
    const input = typeof markdownText === 'function' ? markdownText() : markdownText;
    const format = typeof maybeFormat === 'function' ? maybeFormat() : maybeFormat || 'glimdown';

    const compiler = getCompiler(owner);

    return compile(compiler, input, {
      format: format,
    });
  });
}

resourceFactory(Compiled);
