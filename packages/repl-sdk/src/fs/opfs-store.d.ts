export interface PackageIndex {
  name: string;
  fetchedAt: number;
  'dist-tags': { [tag: string]: string };
  versions: { [version: string]: { dist: { tarball: string } } };
}

export type PackFiles = { [path: string]: [offset: number, length: number] };
export interface Pack {
  files: PackFiles;
  blob: Blob;
}

export function writePack(
  name: string,
  version: string,
  entries: { path: string; data: Uint8Array<ArrayBuffer> }[]
): Promise<PackFiles | undefined>;
export function openPack(name: string, version: string): Promise<Pack | undefined>;
export function readIndex(name: string): Promise<PackageIndex | undefined>;
export function writeIndex(name: string, index: PackageIndex): Promise<void>;
export function clearStore(): Promise<void>;
