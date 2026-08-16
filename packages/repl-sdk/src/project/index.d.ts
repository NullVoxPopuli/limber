export interface FileJSON {
  path: string;
  text: string;
  format?: string;
}

export interface ProjectJSON {
  entry: string;
  files: FileJSON[];
}

export type FilesInput =
  | Iterable<File | FileJSON>
  | Map<string, File | string>
  | Record<string, string>;

export function normalize(path: string): string;
export function basename(path: string): string;
export function dirname(path: string): string;
export function extname(path: string): string;

/**
 * The extension for a format, dropping the flavor: `hbs|ember` is a `.hbs` file.
 */
export function extFor(format: string): string;

export const DEFAULT_ENTRY_NAME: string;

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

type ParamsInput = URLSearchParams | string | Record<string, string> | undefined;

export namespace urlAdapter {
  const TEXT_PARAM: 'c';
  const LEGACY_TEXT_PARAM: 't';
  const FORMAT_PARAM: 'format';
  const PROJECT_PARAM: 'p';
  const OWNED_PARAMS: string[];
  const DEFAULT_LENGTH_BUDGET: number;

  function parse(input: ParamsInput): Project | null;
  function serialize(project: Project, options?: { into?: ParamsInput }): URLSearchParams;
  function serializedLength(project: Project): number;
  function fits(project: Project, options?: { budget?: number }): boolean;
}

export namespace localStorageAdapter {
  const ACTIVE_KEY: string;
  const PROJECT_PREFIX: string;
  const LEGACY_ACTIVE_KEY: string;
  const LEGACY_FORMAT_KEY: string;
  const LEGACY_DOCUMENT_KEY: string;

  function activeFormat(options?: { storage?: Storage }): string | null;
  function parse(options?: { storage?: Storage; format?: string | undefined }): Project | null;
  function serialize(project: Project, options?: { storage?: Storage }): void;
}
