import type { Project } from './project.js';

export const ACTIVE_KEY: string;
export const PROJECT_PREFIX: string;
export const LEGACY_ACTIVE_KEY: string;
export const LEGACY_FORMAT_KEY: string;
export const LEGACY_DOCUMENT_KEY: string;

export function storedFormat(options?: { storage?: Storage }): string | null;
export function readStoredProject(options?: {
  storage?: Storage;
  format?: string | undefined;
}): Project | null;
export function writeStoredProject(project: Project, options?: { storage?: Storage }): void;
