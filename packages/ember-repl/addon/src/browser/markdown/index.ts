import { type ComponentLike } from '@glint/template';

import { nameFor } from '../utils';
import {
  compileGJS as processGJS,
  compileHBS as processHBS,
  compileMD as processMD,
} from './formats/glimdown';

import type { CompileResult } from '../types';
import type { EvalImportMap, ScopeMap } from './formats/types';
type Format = 'glimdown' | 'gjs' | 'hbs';

export const CACHE = new Map<string, ComponentLike>();

const SUPPORTED_FORMATS = ['glimdown', 'gjs', 'hbs'];

/**
 * This compileMD is a more robust version of the raw compiling used in "formats".
 * This function manages cache, and has events for folks building UIs to hook in to
 */
export async function compileMD(
  text: string,
  {
    format,
    onSuccess,
    onError,
    onCompileStart,
    ...options
  }: {
    format: Format;
    onSuccess: (component: ComponentLike) => Promise<unknown>;
    onError: (error: string) => Promise<unknown>;
    onCompileStart: () => Promise<unknown>;
    importMap?: EvalImportMap;
    CopyComponent?: string;
    topLevelScope?: ScopeMap;
  }
) {
  let id = nameFor(text);

  let existing = CACHE.get(id);

  if (existing) {
    onSuccess(existing);

    return;
  }

  if (!SUPPORTED_FORMATS.includes(format)) {
    await onError(`Unsupported format: ${format}. Supported formats: ${SUPPORTED_FORMATS}`);

    return;
  }

  await onCompileStart();

  if (!text) {
    await onError('No Input Document yet');

    return;
  }

  let result: CompileResult;

  if (format === 'glimdown') {
    result = await processMD(text, options);
  } else if (format === 'gjs') {
    result = await processGJS(text, options.importMap);
  } else if (format === 'hbs') {
    result = await processHBS(text, options.topLevelScope);
  } else {
    await onError(`Unsupported format: ${format}. Supported formats: ${SUPPORTED_FORMATS}`);

    return;
  }

  if (result.error) {
    await onError(result.error.message || `${result.error}`);

    return;
  }

  CACHE.set(id, result.component as ComponentLike);

  await onSuccess(result.component as ComponentLike);
}
