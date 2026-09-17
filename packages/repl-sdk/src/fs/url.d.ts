export type SourceType = 'js' | 'css' | 'json' | 'ts';

/**
 * `file:///node_modules/`. A file's URL path is its path in storage.
 */
export const NODE_MODULES_PREFIX: string;

/**
 * `file:///node_modules/.deps/`, where the installed files are.
 */
export const DEPS_PREFIX: string;

/**
 * `file:///src/`, where the compiled snippet lives.
 */
export const SRC_PREFIX: string;
export const VIRTUAL_PREFIX: string;

/**
 * The path in storage a URL names, without the query.
 */
export function pathOf(url: string): string;
export function urlFor(path: string): string;

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
