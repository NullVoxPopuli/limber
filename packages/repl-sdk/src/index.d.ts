import type { Storage } from './fs/storage.js';
import type { Options, PublicMethods } from './types.ts';
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

export const defaultFormats: string[];
export const defaults: Pick<Options, 'formats'>;

export class Compiler {
  constructor(options?: Partial<Options>);

  compile: PublicMethods['compile'];

  /**
   * Runs the `buildStart` of every plugin, such as the install of a pinned ember-source.
   * `compile` calls this. A host calls it first to load pinned modules before a compile.
   * With a format, the plugins of that format's compiler config run too,
   * even when that compiler has not loaded yet.
   */
  prepare(versions?: Record<string, string>, format?: string, flavor?: string): Promise<void>;

  /**
   * Loads modules the way a compiler does: through the plugins, so a pin applies.
   */
  tryResolveAll(names: string[]): Promise<unknown[]>;

  optionsFor: PublicMethods['optionsFor'];

  /**
   * The file system: installed packages under `/node_modules`,
   * and the compiled snippet under `/src`.
   */
  readonly fs: Storage;

  announceError(message: string): void;

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

      /**
       * More codemirror extensions, after the ones of repl-sdk.
       */
      extensions?: unknown[];
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
