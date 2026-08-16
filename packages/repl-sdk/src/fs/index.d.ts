import type { UntarredPackage } from '../types.ts';

export type SourceType = 'js' | 'css' | 'json' | 'ts';

export interface VirtualFile {
  type: SourceType;
  source: string;
}

export const NPM_PREFIX: string;
export const VIRTUAL_PREFIX: string;

export function npmUrl(name: string, version: string, path?: string): string;
export function parseNpmUrl(
  url: string
): undefined | { name: string; version: string; path: string };
export function specifierUrl(specifier: string): string;
export function virtualUrl(kind: 'manual' | 'configured', name: string): string;
export function parseVirtualUrl(url: string): undefined | { kind: string; name: string };
export function typeFor(path: string): SourceType;

/**
 * Source for a module that is already a live JS object. Export names are
 * emitted as string literals, because they are not required to be identifiers
 * and real packages use that.
 */
export function virtualModuleSource(name: string, value: object, globalKey: string): string;

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

  /**
   * Turn the provisional URL a synchronous resolve produced into the URL of a
   * file that now exists, downloading the package if needed.
   */
  resolveUrl(url: string): Promise<string | undefined>;

  clear(): void;
}

/**
 * One fs per page, not one per Compiler: es-module-shims keys its module
 * registry by URL globally.
 */
export const vfs: VFS;
export const installer: Installer;
export function clearFs(): void;
