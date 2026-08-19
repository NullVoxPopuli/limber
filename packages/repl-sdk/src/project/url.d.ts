import type { Project } from './project.js';

type ParamsInput = URLSearchParams | string | Record<string, string> | undefined;

export const TEXT_PARAM: 'c';
export const LEGACY_TEXT_PARAM: 't';
export const FORMAT_PARAM: 'format';
export const OWNED_PARAMS: string[];

export function readProject(input: ParamsInput): Project | null;
export function writeProject(project: Project, options?: { into?: ParamsInput }): URLSearchParams;
