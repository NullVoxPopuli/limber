import type { Options } from "./types.ts";

export const defaultFormats: Options['formats'];
export const defaults: Options;

export class Compiler {
  constructor(options?: Options);

  compile(format: string, text: string): Promise<HTMLElement>;
}
