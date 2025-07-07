import type { CompilerConfig, Options } from './types.ts';
import type { EditorView } from 'codemirror';

export type { ErrorMessage, InfoMessage, Message, Options } from './types.ts';

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
    }
  ): Promise<{ element: HTMLElement; destroy: () => void }>;

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
}
