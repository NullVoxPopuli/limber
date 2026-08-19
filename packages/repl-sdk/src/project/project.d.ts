import type { File } from './file.js';

export type { File };

export type FilesInput =
  | Iterable<File | { path: string; text: string; format?: string }>
  | Map<string, File | string>
  | Record<string, string>;

export interface ProjectJSON {
  entry: string;
  files: { path: string; text: string; format?: string }[];
}

/**
 * The extension for a format, dropping the flavor: `hbs|ember` is a `.hbs` file.
 */
export function extFor(format: string): string;

export const DEFAULT_ENTRY_NAME: string;

export class Project {
  constructor(files: Map<string, File>, entry: string);

  static from(options?: { files?: FilesInput; entry?: string | undefined }): Project;
  static single(
    text: string,
    options?: { format?: string | undefined; path?: string | undefined }
  ): Project;
  static fromJSON(json: Partial<ProjectJSON>): Project;
  static readonly empty: Project;

  readonly files: File[];
  readonly paths: string[];
  readonly size: number;
  readonly isEmpty: boolean;
  readonly isSingleFile: boolean;
  readonly entryPath: string;
  readonly entry: File | undefined;
  readonly format: string | undefined;

  has(path: string): boolean;
  file(path: string): File | undefined;
  read(path: string): string | undefined;

  write(path: string, text: string, options?: { format?: string | undefined }): Project;
  remove(path: string): Project;
  rename(from: string, to: string): Project;
  withEntry(path: string): Project;
  withEntryText(text: string, options?: { format?: string | undefined }): Project;
  withFormat(format: string | undefined): Project;

  equals(other: unknown): boolean;
  toJSON(): ProjectJSON;
}
