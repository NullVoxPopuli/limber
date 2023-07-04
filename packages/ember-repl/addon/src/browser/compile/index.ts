import { cell, resource, resourceFactory } from 'ember-resources';

import { nameFor } from '../utils';
import {
  compileGJS as processGJS,
  compileHBS as processHBS,
  compileMD as processMD,
} from './formats';

import type { CompileResult } from '../types';
import type { EvalImportMap, ScopeMap } from './types';
import type { ComponentLike } from '@glint/template';
type Format = 'glimdown' | 'gjs' | 'hbs';

export const CACHE = new Map<string, ComponentLike>();

const SUPPORTED_FORMATS = ['glimdown', 'gjs', 'hbs'];

/**
 * This compileMD is a more robust version of the raw compiling used in "formats".
 * This function manages cache, and has events for folks building UIs to hook in to
 */
export async function compile(
  text: string,
  {
    format,
    onSuccess,
    onError,
    onCompileStart,
    ...options
  }: {
    format: Format;
    onSuccess: (component: ComponentLike) => Promise<unknown> | unknown;
    onError: (error: string) => Promise<unknown> | unknown;
    onCompileStart: () => Promise<unknown> | unknown;
    importMap?: EvalImportMap;
    CopyComponent?: string;
    ShadowComponent?: string;
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
    result = await processHBS(text, {
      scope: options.topLevelScope,
    });
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

type Input = string | undefined | null;

type ExtraOptions =
  | {
      format: 'glimdown';
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

export function buildCompiler(markdownText: Input | (() => Input)): Value;
export function buildCompiler(markdownText: Input | (() => Input), options?: Format): Value;
export function buildCompiler(markdownText: Input | (() => Input), options?: () => Format): Value;
export function buildCompiler(markdownText: Input | (() => Input), options?: ExtraOptions): Value;
export function buildCompiler(
  markdownText: Input | (() => Input),
  options?: () => ExtraOptions
): Value;

export function buildCompiler(
  markdownText: Input | (() => Input),
  maybeOptions?: Format | (() => Format) | ExtraOptions | (() => ExtraOptions)
): Value {
  return resource(() => {
    let maybeObject = typeof maybeOptions === 'function' ? maybeOptions() : maybeOptions;
    let format =
      (typeof maybeObject === 'string' ? maybeObject : maybeObject?.format) || 'glimdown';
    let options = (typeof maybeObject === 'string' ? {} : maybeObject) || {};

    let input = typeof markdownText === 'function' ? markdownText() : markdownText;
    let ready = cell(false);
    let error = cell<string | null>();
    let result = cell<ComponentLike>();

    if (input) {
      compile(input, {
        format,
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

/**
 * By default, this compiles to `glimdown`. A Markdown format which
 * extracts `live` tagged code snippets and compiles them to components.
 */
export const Compiled = resourceFactory(buildCompiler) as typeof buildCompiler;
