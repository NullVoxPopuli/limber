import type { Project } from './project.js';

type ParamsInput = URLSearchParams | string | Record<string, string> | undefined;

export const TEXT_PARAM: 'c';
export const LEGACY_TEXT_PARAM: 't';
export const FORMAT_PARAM: 'format';
export const OWNED_PARAMS: string[];
export const DEFAULT_LENGTH_BUDGET: number;

export function readProject(input: ParamsInput): Project | null;
export function writeProject(project: Project, options?: { into?: ParamsInput }): URLSearchParams;
export function serializedLength(project: Project): number;
export function fits(project: Project, options?: { budget?: number }): boolean;
