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

  createEditor(
    element: HTMLElement,
    text: string,
    format: string,
    handleUpdate: (updatedText: string) => void
  ): Promise<{ view: EditorView; setText: (text: string, format: string) => Promise<void> }>;
}
