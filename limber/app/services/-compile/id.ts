import { guidFor } from '@ember/object/internals';
import { camelize, capitalize } from '@ember/string';

type Kind = 'markdown' | 'gjs';

export function nameForSnippet(code: string, kind: Kind = 'markdown') {
  switch (kind) {
    case 'markdown':
      return `runtime-${guidFor(code)}`;
    case 'gjs':
      return 'eh';
    default:
      throw new Error(`Unknown kind: ${kind}`);
  }
}

export function invocationOf(name: string) {
  return `<${capitalize(camelize(name))} />`;
}
