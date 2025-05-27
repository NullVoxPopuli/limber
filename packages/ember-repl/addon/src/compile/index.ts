import { cell, resource, resourceFactory } from 'ember-resources';

import { nameFor } from './utils.ts';

import type CompilerService from '../services/compiler.ts';
import type { CompileResult, EvalImportMap, ScopeMap, UnifiedPlugin } from './types.ts';
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

  // Make overloads easier?
  remarkPlugins?: never;
  rehypePlugins?: never;
  CopyComponent?: never;
  ShadowComponent?: never;
}

interface HBSOptions extends Scope, Events {
  format: 'hbs';
  topLevelScope?: ScopeMap;

  // Make overloads easier?
  remarkPlugins?: never;
  rehypePlugins?: never;
  CopyComponent?: never;
  ShadowComponent?: never;
}

/**
 * Compile GitHub-flavored Markdown with GJS support
 * and optionally render gjs-snippets via a `live` meta tag
 * on the code fences.
 */
export async function compile(
  service: CompilerService,
  text: string,
  options: GlimdownOptions
): Promise<void>;

/**
 * Compile GJS
 */
export async function compile(
  service: CompilerService,
  text: string,
  options: GJSOptions
): Promise<void>;

/**
 * Compile a stateless component using just the template
 */
export async function compile(
  service: CompilerService,
  text: string,
  options: HBSOptions
): Promise<void>;

/**
 * This compileMD is a more robust version of the raw compiling used in "formats".
 * This function manages cache, and has events for folks building UIs to hook in to
 */
export async function compile(
  service: CompilerService,
  text: string,
  options: GlimdownOptions | GJSOptions | HBSOptions
): Promise<void> {
  const { onSuccess, onError, onCompileStart } = options;
  const id = nameFor(`${options.format}:${text}`);

  const existing = CACHE.get(id);

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
    result = await service.compileMD(text);
  } else if (options.format === 'gjs') {
    result = await service.compileGJS(text);
  } else if (options.format === 'hbs') {
    result = await service.compileHBS(text);
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
      rehypePlugins?: UnifiedPlugin[];
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
  return resource(({ owner }) => {
    const maybeObject = typeof maybeOptions === 'function' ? maybeOptions() : maybeOptions;
    const format =
      (typeof maybeObject === 'string' ? maybeObject : maybeObject?.format) || 'glimdown';
    const options = (typeof maybeObject === 'string' ? {} : maybeObject) || {};

    const input = typeof markdownText === 'function' ? markdownText() : markdownText;
    const ready = cell(false);
    const error = cell<string | null>();
    const result = cell<ComponentLike>();

    const compiler = owner.lookup('service:compiler') as CompilerService;

    if (input) {
      compile(compiler, input, {
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
