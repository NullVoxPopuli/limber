import { type ComponentLike } from '@glint/template';

import { nameFor } from '../utils';

import type { EvalImportMap, ScopeMap } from './formats/types';
type Format = 'glimdown' | 'gjs' | 'hbs';

export const CACHE = new Map<string, ComponentLike>();

const SUPPORTED_FORMATS = ['glimdown', 'gjs', 'hbs'];

import { compileGJS, compileHBS, compileMD } from './formats/glimdown';

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

  let compiler = await getCompiler(format)?.();

  if (!compiler) {
    await onError('Could not find compiler');

    return;
  }

  if (!text) {
    await onError('No Input Document yet');

    return;
  }

  let { error, rootComponent } = await compiler.compile(text);

  if (error) {
    await onError(error.message || `${error}`);

    return;
  }

  CACHE.set(id, rootComponent as ComponentLike);

  await onSuccess(rootComponent as ComponentLike);
}
