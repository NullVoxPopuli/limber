import { CompileState, MissingTextState, REJECT, RESOLVE } from './state.ts';
import { nameFor } from './utils.ts';

import type CompilerService from '../services/compiler.ts';
import type { CompileResult, Format, Input } from './types.ts';
import type { ComponentLike } from '@glint/template';

export const CACHE = new Map<string, ComponentLike>();

interface Options {
  format: Format;
  flavor?: string;
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
  onSuccess?: (component: ComponentLike) => Promise<unknown> | unknown;
  onError?: (error: string) => Promise<unknown> | unknown;
  onCompileStart?: () => Promise<unknown> | unknown;
}

export function compile(service: CompilerService, text: Input, options: Options): CompileState {
  const data = { format: options.format };

  if (!text) {
    return new MissingTextState(data);
  }

  const id = nameFor(`${options.format}:${text}`);

  const state = new CompileState(data);

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
  await options?.onCompileStart?.();
  await Promise.resolve();

  if (!text) {
    state[REJECT](new Error('No Input Document yet'));
    await options?.onError?.('No Input Document yet');

    return;
  }

  let result: CompileResult;

  // TODO: just use compile, eliminate all this branching
  if (options.format === 'glimdown') {
    result = await service.compile('gmd', text, options as any);
  } else if (options.format === 'gjs') {
    result = await service.compileGJS(text);
  } else if (options.format === 'hbs') {
    result = await service.compileHBS(text, options as any);
  } else {
    result = await service.compile(
      options.format,
      text,
      options as unknown as Record<string, unknown>
    );
  }

  if (result.error) {
    state[REJECT](result.error);
    await options?.onError?.(state.reason || 'Unknown Error');

    return;
  }

  CACHE.set(id, result.component as ComponentLike);

  state[RESOLVE](result.component as ComponentLike);

  await options?.onSuccess?.(result.component as ComponentLike);
}
