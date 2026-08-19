export class File {
  constructor(path: string, text: string, options?: { format?: string | undefined });

  readonly path: string;
  readonly text: string;
  readonly name: string;
  readonly ext: string;

  /**
   * The explicit format, falling back to the extension.
   */
  readonly format: string;
  readonly hasExplicitFormat: boolean;

  withText(text: string): File;
  withPath(path: string): File;
  withFormat(format: string | undefined): File;
  equals(other: unknown): boolean;
}
