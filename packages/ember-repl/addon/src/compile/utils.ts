import { assert } from '@ember/debug';

import { pascalCase } from 'change-case';
import { v5 as uuidv5 } from 'uuid';

/**
 * a namespace is required for uuid v5
 *
 * it helps generate stable outputs for for any given input.
 */
const NAMESPACE = '926f034a-f480-4112-a363-321244f4e5de';
const DEFAULT_PREFIX = 'ember-repl';

/**
 * For any given code block, a reasonably stable name can be
 * generated.
 * This can help with cacheing previously compiled components,
 * and generally allowing a consumer to derive "known references" to user-input
 */
export function nameFor(code: string, prefix = DEFAULT_PREFIX) {
  const id = uuidv5(code, NAMESPACE);

  return `${prefix ? `${prefix}-` : ''}${id}`;
}

/**
 * Returns the text for invoking a component with a given name.
 * It is assumed the component takes no arguments, as would be the
 * case in REPLs / Playgrounds for the "root" component.
 */
export function invocationOf(name: string) {
  assert(
    `You must pass a name to invocationOf. Received: \`${name}\``,
    typeof name === 'string' && name.length > 0
  );

  if (name.length === 0) {
    throw new Error(`name passed to invocationOf must have non-0 length`);
  }

  return `<${invocationName(name)} />`;
}

/**
 * Core team does not want to support changes to '@ember/string' (v2 addonification, specifically)
 * inflection does not support hyphens
 */
export function invocationName(name: string) {
  return pascalCase(name).replaceAll('_', '');
}
