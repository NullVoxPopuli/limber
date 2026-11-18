import type { InstalledPackage } from '../types.ts';
import type { FsWorker } from './worker.js';

export type AddImportMap = (map: {
  imports?: Record<string, string>;
  scopes?: Record<string, Record<string, string>>;
}) => void;

export class Installer {
  constructor(options: {
    worker: Pick<FsWorker, 'install' | 'installed' | 'link' | 'links'>;
    addImportMap?: AddImportMap;
  });

  /**
   * Puts a package in the file system without asking for a file in it.
   * The linked version wins when there is one. Resolves to the version in
   * storage.
   */
  ensure(name: string, version: string): Promise<string>;

  /**
   * The package that a range resolves to, installed.
   */
  package(name: string, range: string): Promise<InstalledPackage>;

  /**
   * Turn the provisional URL a synchronous resolve produced into the URL of a
   * file that now exists, downloading the package if needed.
   */
  resolveUrl(url: string): Promise<string | undefined>;

  clear(): void;
}
