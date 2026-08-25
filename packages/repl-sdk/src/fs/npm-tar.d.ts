import type { UntarredPackage } from '../types.ts';

export function getTar(name: string, version: string): Promise<UntarredPackage>;
export function clearTarCache(): void;
