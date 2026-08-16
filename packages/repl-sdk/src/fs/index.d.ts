import type { UntarredPackage } from '../types.ts';

export type SourceType = 'js' | 'css' | 'json' | 'ts';

export interface VirtualFile {
  type: SourceType;
  source: string;
}

export const NPM_PREFIX: string;

export function npmUrl(name: string, version: string, path?: string): string;
export function parseNpmUrl(
  url: string
): undefined | { name: string; version: string; path: string };
export function typeFor(path: string): SourceType;

export class VFS {
  /**
   * URLs the source hook has served, in order.
   */
  reads: string[];
  readonly size: number;

  write(url: string, source: string, type?: SourceType): void;
  read(url: string): undefined | VirtualFile;
  has(url: string): boolean;
  list(prefix?: string): string[];
  clear(): void;
}

export function createSourceHook(
  vfs: VFS,
  onMiss?: (url: string) => Promise<void>
): (
  url: string,
  fetchOpts: RequestInit,
  parent: string,
  defaultSourceHook: (url: string, fetchOpts: RequestInit, parent: string) => Promise<unknown>
) => Promise<unknown>;

export type GetTar = (name: string, version: string) => Promise<UntarredPackage>;

export function getTar(name: string, version: string): Promise<UntarredPackage>;
export function clearTarCache(): void;

export class Installer {
  constructor(options: { vfs: VFS; getTar: GetTar });

  /**
   * The accumulated import map. Hand this to `importShim.addImportMap`.
   */
  readonly imports: Record<string, string>;

  install(
    specifier: string
  ): Promise<{ specifier: string; url: string; name: string; version: string }>;
}
