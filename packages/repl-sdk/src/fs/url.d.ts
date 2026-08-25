export type SourceType = 'js' | 'css' | 'json' | 'ts';

export const NPM_PREFIX: string;
export const VIRTUAL_PREFIX: string;

export function npmUrl(name: string, version: string, path?: string): string;
export function parseNpmUrl(
  url: string
): undefined | { name: string; version: string; path: string };

/**
 * What a synchronous resolve can say about a bare specifier before anything
 * has been downloaded.
 */
export function specifierUrl(specifier: string): string;
export function virtualUrl(kind: 'manual' | 'configured', name: string): string;
export function parseVirtualUrl(url: string): undefined | { kind: string; name: string };
export function extensionOf(url: string): string;
export function typeFor(url: string): SourceType;
