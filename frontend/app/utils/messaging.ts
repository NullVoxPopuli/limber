/**
 * NOTE: window's on message handler receives *a lot* of messages
 *   (esp from various browser extensions)
 *
 */
import { warn } from '@ember/debug';

export type Format = 'glimdown' | 'gjs' | 'hbs';

export type NewContent = {
  format: Format;
  content: string;
};

export type Ready = { status: 'ready' };
export type Success = { status: 'success' };
export type CompileBegin = { status: 'compile-begin' };
export type Error =
  | { status: 'error'; error: string }
  | { status: 'error'; error: string; unrecoverable: true }
  | { status: 'error'; error: string; errorLine: number };

type FromLimber = { from: 'limber' };
type FromLimberOutput = { from: 'limber-output' };

export type FromParent = FromLimber & ToOutput;
export type ToOutput = NewContent;

export type FromOutput = FromLimberOutput & ToParent;
export type ToParent = Ready | Error | Success | CompileBegin;

export const DEFAULT_FORMAT = 'glimdown' as const;
export const ALLOWED_FORMATS = [DEFAULT_FORMAT, 'gjs', 'hbs'] as const;
export const STATUSES = ['ready', 'error'] as const;

export function isAllowedFormat(x?: string): x is Format {
  return Boolean(x && (ALLOWED_FORMATS as readonly string[]).includes(x));
}

export function hasAllowedFormat<T extends { format?: string }>(x: T): x is T & NewContent {
  return isAllowedFormat(x.format);
}

export const hasFrom = (x?: object): x is { from: unknown } => Boolean(x && 'from' in x);
export const hasFormat = (x?: object): x is { format: unknown } => Boolean(x && 'format' in x);
export const hasContent = (x?: object): x is { content: unknown } => Boolean(x && 'content' in x);

export function fromOutput<T extends { from?: string }>(x?: T | null): x is T & FromOutput {
  if (!x) return false;

  if ('from' in x && x.from) {
    return x.from === 'limber-output';
  }

  return false;
}

export function fromParent<T extends { from?: string }>(x?: T | null): x is T & FromParent {
  if (!x) return false;

  if ('from' in x && x.from) {
    return x.from === 'limber';
  }

  return false;
}

export function hasStatus<T extends { status?: string }>(x: T): x is T & (Ready | Error)['status'] {
  if ('status' in x && x.status) {
    return (STATUSES as readonly string[]).includes(x.status);
  }

  return false;
}

export function hasError<T extends { error?: string; status?: string }>(x: T): x is T & Error {
  if (!hasStatus(x)) return false;
  if (x.status !== 'error') return false;

  return true;
}

export function parseEvent(event: MessageEvent): null | FromParent | FromOutput {
  let { data } = event;

  if (!data) {
    return null;
  }

  if (typeof data !== 'string') {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any;

  try {
    json = JSON.parse(data);
  } catch (e) {
    warn(e.message, { id: 'messaging JSON.parse error' });

    return null;
  }

  if (!hasFrom(json)) {
    return null;
  }

  if (json.from !== 'limber' && json.from !== 'limber-output') {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return json as any; // likely? -- being lazy
}
