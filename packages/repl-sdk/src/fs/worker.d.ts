import type { InstalledPackage } from '../types.ts';

/**
 * The worker that owns writes to the file system.
 */
export interface FsWorker {
  /**
   * Makes sure a package is in storage and describes it.
   */
  install(name: string, version: string): Promise<InstalledPackage>;

  /**
   * Every complete package in storage, as name → versions.
   */
  installed(): Promise<Record<string, string[]>>;

  /**
   * Makes `/node_modules/<name>` mean one installed version.
   */
  link(name: string, version: string): Promise<void>;
  links(): Promise<Record<string, string>>;

  write(path: string, text: string): Promise<void>;
}

export function fsWorker(): FsWorker;
