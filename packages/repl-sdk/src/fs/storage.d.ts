import type { InstalledPackage } from '../types.ts';

export const NODE_MODULES: 'node_modules';
export const DEPS: '.deps';

export type Contents = Record<string, { text: string }>;

export function packageDirectory(name: string, version: string): string;
export function linkDirectory(name: string): string;

/**
 * The origin private file system, laid out like a project:
 * `/node_modules/<name>@<version>/...` and `/src/index.<ext>`.
 */
export class Storage {
  constructor(getDirectory?: () => Promise<FileSystemDirectoryHandle>);

  readonly root: Promise<FileSystemDirectoryHandle>;

  read(path: string): Promise<undefined | string>;
  readBytes(path: string): Promise<undefined | Uint8Array>;

  /**
   * What a path is, following links. Undefined when there is nothing there.
   */
  stat(
    path: string
  ): Promise<undefined | { type: 'file' | 'directory'; size: number; mtime: number }>;

  /**
   * The names in a directory, following links, without the storage's markers.
   */
  entries(path: string): Promise<undefined | { name: string; type: 'file' | 'directory' }[]>;

  /**
   * The real path, following a link under `/node_modules/<name>/` into `.deps`.
   */
  resolve(path: string): Promise<string>;
  write(path: string, text: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  remove(path: string): Promise<void>;

  /**
   * Every file under a directory, as absolute paths.
   */
  list(path: string): Promise<string[]>;

  clear(): Promise<void>;

  /**
   * Every complete package, as name → versions.
   */
  installed(): Promise<Record<string, string[]>>;

  /**
   * Makes `/node_modules/<name>` mean one installed version.
   */
  link(name: string, version: string): Promise<void>;
  linkOf(name: string): Promise<undefined | string>;
  links(): Promise<Record<string, string>>;

  /**
   * Undefined when the package is missing or incomplete.
   */
  readPackage(name: string, version: string): Promise<undefined | InstalledPackage>;

  writePackage(name: string, version: string, contents: Contents): Promise<InstalledPackage>;
}
