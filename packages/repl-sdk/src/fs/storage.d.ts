import type { InstalledPackage } from '../types.ts';

export const NODE_MODULES: 'node_modules';

export type Contents = Record<string, { text: string }>;

export function packageDirectory(name: string, version: string): string;

/**
 * The origin private file system, laid out like a project:
 * `/node_modules/<name>@<version>/...` and `/src/index.<ext>`.
 */
export class Storage {
  constructor(getDirectory?: () => Promise<FileSystemDirectoryHandle>);

  readonly root: Promise<FileSystemDirectoryHandle>;

  read(path: string): Promise<undefined | string>;
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
   * Undefined when the package is missing or incomplete.
   */
  readPackage(name: string, version: string): Promise<undefined | InstalledPackage>;

  writePackage(name: string, version: string, contents: Contents): Promise<InstalledPackage>;
}
