import type { CompilerConfig, Options } from './types.ts';
import type { EditorView } from 'codemirror';

export type { ErrorMessage, InfoMessage, Message, Options } from './types.ts';

/**
 * Builds the most useful human-readable message from a thrown error,
 * including the explanation and code-frame from SWC / content-tag
 * parse errors (which hide those on a non-standard `source_code` property).
 */
export function errorMessage(error: unknown): string;

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
   * Resolution is synchronous, so a pinned v2 addon must be installed
   * before anything imports one of its renamed modules, such as `@ember/*` from ember-source.
   * `compile` calls this. A host calls it first to load pinned modules before a compile.
   */
  prepare(versions?: Record<string, string>): Promise<void>;

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
