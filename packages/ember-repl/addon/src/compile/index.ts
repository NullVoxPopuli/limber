import { cell, resource, resourceFactory } from 'ember-resources';

import {
  compileGJS as processGJS,
  compileHBS as processHBS,
  compileMD as processMD,
} from './formats.ts';
import { nameFor } from './utils.ts';

import type { CompileResult, UnifiedPlugin } from './types.ts';
import type { EvalImportMap, ScopeMap } from './types.ts';
import type { ComponentLike } from '@glint/template';
type Format = 'glimdown' | 'gjs' | 'hbs';

export const CACHE = new Map<string, ComponentLike>();

interface Events {
  onSuccess: (component: ComponentLike) => Promise<unknown> | unknown;
  onError: (error: string) => Promise<unknown> | unknown;
  onCompileStart: () => Promise<unknown> | unknown;
}

interface Scope {
  importMap?: EvalImportMap;
}

const SUPPORTED_FORMATS = ['glimdown', 'gjs', 'hbs'];

interface GlimdownOptions extends Scope, Events {
  format: 'glimdown';
  remarkPlugins?: UnifiedPlugin[];
  rehypePlugins?: UnifiedPlugin[];
  CopyComponent?: string;
  ShadowComponent?: string;
  topLevelScope?: ScopeMap;
}
interface GJSOptions extends Scope, Events {
  format: 'gjs';
}

interface HBSOptions extends Scope, Events {
  format: 'hbs';
  topLevelScope?: ScopeMap;
}

/**
 * Compile GitHub-flavored Markdown with GJS support
 * and optionally render gjs-snippets via a `live` meta tag
 * on the code fences.
 */
export async function compile(text: string, options: GlimdownOptions): Promise<void>;

/**
 * Compile GJS
 */
export async function compile(text: string, options: GJSOptions): Promise<void>;

/**
 * Compile a stateless component using just the template
 */
export async function compile(text: string, options: HBSOptions): Promise<void>;

/**
 * This compileMD is a more robust version of the raw compiling used in "formats".
 * This function manages cache, and has events for folks building UIs to hook in to
 */
export async function compile(
  text: string,
  options: GlimdownOptions | GJSOptions | HBSOptions
): Promise<void> {
  let { onSuccess, onError, onCompileStart } = options;
  let id = nameFor(text);

  let existing = CACHE.get(id);

  if (existing) {
    onSuccess(existing);

    return;
  }

  if (!SUPPORTED_FORMATS.includes(options.format)) {
    await onError(`Unsupported format: ${options.format}. Supported formats: ${SUPPORTED_FORMATS}`);

    return;
  }

  await onCompileStart();

  if (!text) {
    await onError('No Input Document yet');

    return;
  }

  let result: CompileResult;

  if (options.format === 'glimdown') {
    result = await processMD(text, options);
  } else if (options.format === 'gjs') {
    result = await processGJS(text, options.importMap);
  } else if (options.format === 'hbs') {
    result = await processHBS(text, {
      scope: options.topLevelScope,
    });
  } else {
    await onError(
      `Unsupported format: ${(options as any).format}. Supported formats: ${SUPPORTED_FORMATS}`
    );

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
      remarkPlugins?: UnifiedPlugin[];
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
