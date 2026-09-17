import type { Installer } from './install.js';
import type { Storage } from './storage.js';

/**
 * The page's file system. Reads happen here; writes go through the worker.
 */
export const storage: Storage;

export const installer: Installer;

/**
 * Forgets what this page resolved. The files stay.
 */
export function clearFs(): void;

/**
 * The es-module-shims `source` hook, over the given file system and installer.
 */
export function createSourceHook(
  files: Storage,
  installs: Installer
): (
  url: string,
  fetchOpts: RequestInit,
  parent: string,
  defaultSourceHook: (url: string, fetchOpts: RequestInit, parent: string) => Promise<unknown>
) => Promise<unknown>;
