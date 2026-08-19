import type { Project } from './project.js';

export const ACTIVE_KEY: string;
export const PROJECT_PREFIX: string;
export const LEGACY_ACTIVE_KEY: string;
export const LEGACY_FORMAT_KEY: string;
export const LEGACY_DOCUMENT_KEY: string;

export function storedFormat(): string | null;
export function readStoredProject(options?: { format?: string | undefined }): Project | null;
export function writeStoredProject(project: Project): void;
