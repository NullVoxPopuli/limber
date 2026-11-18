import type { CompilerConfig, Options } from './types.ts';
import type { EditorView } from 'codemirror';

export type {
  ErrorMessage,
  InfoMessage,
  LoadResult,
  Message,
  Options,
  Plugin,
  PluginContext,
} from './types.ts';

/**
 * Builds the most useful human-readable message from a thrown error,
 * including the explanation and code-frame from SWC / content-tag
 * parse errors (which hide those on a non-standard `source_code` property).
 */
export function errorMessage(error: unknown): string;

/**
 * A module of the `preload` option, as the compile in progress loaded it.
 * `undefined` when it did not load, such as a module that a pinned version does not have.
 */
export function preloaded<T = Record<string, unknown>>(id: string): T | undefined;

export const defaultFormats: keyof Options['formats'];
export const defaults: Options;

export class Compiler {
  constructor(options?: Partial<Options>);

  compile(
    format: string,
    text: string,
    options?: {
      flavor?: string;
      fileName?: string;
      /**
       * Package versions for the bare imports of this compile.
       * Overrides the `versions` option.
       */
      versions?: Record<string, string>;
    }
  ): Promise<{ element: HTMLElement; destroy: () => void }>;

  /**
   * Runs the `buildStart` of every plugin, such as the install of a pinned ember-source.
   * `compile` calls this. A host calls it first to load pinned modules before a compile.
   * With a format, the plugins of that format's compiler config run too,
   * even when that compiler has not loaded yet.
   */
  prepare(versions?: Record<string, string>, format?: string, flavor?: string): Promise<void>;

  /**
   * Loads modules the way a compiler does: from the `resolve` option first, then from npm.
   */
  tryResolveAll(names: string[]): Promise<unknown[]>;

  optionsFor(format: string, flavor?: string): Omit<CompilerConfig, 'compiler'>;

  /**
   * Cretes a codemirror editor instance
   */
  createEditor(
    /**
     * The element that the editor will be mounted on to and within
     */
    element: HTMLElement,

    options: {
      /**
       * Initial text
       */
      text?: string | null | undefined;

      /**
       * Initial file format
       */
      format?: string | null | undefined;

      /**
       * When the editor's text is typed in, this callback is triggered.
       * Can be used to update external state (such as a URL or some other storage).
       */
      handleUpdate?: (updatedText: string) => void;
    }
  ): Promise<{
    view: EditorView;
    setText: (text: string, format: string) => Promise<void>;
    setFormat: (format: string) => Promise<void>;
  }>;

  /**
   * Clear promise, npm, tarball, (etc) caches
   */
  static clearCache: () => void;
}
