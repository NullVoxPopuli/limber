export interface PackageIndex {
  name: string;
  fetchedAt: number;
  'dist-tags': { [tag: string]: string };
  versions: { [version: string]: { dist: { tarball: string } } };
}

export function readTarball(name: string, version: string): Promise<ArrayBuffer | undefined>;
export function writeTarball(name: string, version: string, bytes: ArrayBuffer): Promise<void>;
export function readIndex(name: string): Promise<PackageIndex | undefined>;
export function writeIndex(name: string, index: PackageIndex): Promise<void>;
export function clearStore(): Promise<void>;
