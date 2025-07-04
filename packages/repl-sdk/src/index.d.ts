import type { CompilerConfig, Options } from './types.ts';

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
}
