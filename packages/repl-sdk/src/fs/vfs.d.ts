export type SourceType = 'js' | 'css' | 'json' | 'ts';

export interface VirtualFile {
  type: SourceType;
  source: string;
}

export class VFS {
  readonly size: number;

  write(url: string, source: string, type?: SourceType): void;
  read(url: string): undefined | VirtualFile;
  delete(url: string): boolean;
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
