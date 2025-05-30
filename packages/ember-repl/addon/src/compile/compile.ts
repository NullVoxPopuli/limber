import { CachedCompileState, CompileState, MissingTextState, REJECT, RESOLVE } from './state.ts';
import { nameFor } from './utils.ts';

import type CompilerService from '../services/compiler.ts';
import type { CompileResult, Format, Input } from './types.ts';
import type { ComponentLike } from '@glint/template';

export const CACHE = new Map<string, ComponentLike>();

interface Options {
  format: Format;
  onSuccess?: (component: ComponentLike) => Promise<unknown> | unknown;
  onError?: (error: string) => Promise<unknown> | unknown;
  onCompileStart?: () => Promise<unknown> | unknown;
}

/**
 * This compileMD is a more robust version of the raw compiling used in "formats".
 * This function manages cache, and has events for folks building UIs to hook in to
 */
export function compile(service: CompilerService, text: Input, options: Options): CompileState {
  if (!text) {
    return new MissingTextState();
  }

  const { onSuccess } = options;
  const id = nameFor(`${options.format}:${text}`);

  const existing = CACHE.get(id);

  if (existing) {
    onSuccess?.(existing);

    return new CachedCompileState(existing);
  }

  const state = new CompileState();

  // Fills the cache as well
  runTheCompiler({ service, text, options, state, id });

  return state;
}

async function runTheCompiler({
  service,
  text,
  options,
  state,
  id,
}: {
  service: CompilerService;
  text: string;
  options: Options;
  state: CompileState;
  id: string;
}) {
  const { onSuccess, onError, onCompileStart } = options;

  await onCompileStart?.();
  await Promise.resolve();

  if (!text) {
    state[REJECT](new Error('No Input Document yet'));
    await onError?.('No Input Document yet');

    return;
  }

  let result: CompileResult;

  if (options.format === 'glimdown') {
    result = await service.compileMD(text);
  } else if (options.format === 'gjs') {
    result = await service.compileGJS(text);
  } else if (options.format === 'hbs') {
    result = await service.compileHBS(text);
  } else {
    result = await service.compile(options.format, text);
  }

  if (result.error) {
    state[REJECT](result.error);
    await onError?.(state.reason || 'Unknown Error');

    return;
  }

  CACHE.set(id, result.component as ComponentLike);

  state[RESOLVE](result.component as ComponentLike);

  await onSuccess?.(result.component as ComponentLike);
}
