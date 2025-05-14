import type { CompilerConfig, Options } from './types.ts';

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
  ): Promise<HTMLElement>;

  optionsFor(format: string, flavor?: string): Omit<CompilerConfig, 'compiler'>;
}
