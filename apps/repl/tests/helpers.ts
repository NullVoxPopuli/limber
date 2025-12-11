import { getContext } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import { clearCache } from 'ember-repl/test-support';

import type { Registry } from '@ember/service';

export function getService<Key extends keyof Registry>(name: Key): Registry[Key] {
  return (getContext() as any).owner /* TYPE IS INCORRECT */
    .lookup(`service:${name}`);
}

export function clearLocalStorage(hooks: NestedHooks) {
  hooks.beforeEach(function () {
    localStorage.clear();
  });
  hooks.afterEach(function () {
    localStorage.clear();
  });
}

/**
 * in CI we can accidentally by rate limited by esm.sh.
 * So we set a fake delay.
 * this does make tests slower, but I'd rather they pass.
 */
export function setupDelay(hooks: NestedHooks, delay = 1_000) {
  hooks.beforeEach(async function () {
    await new Promise((resolve) => setTimeout(resolve, delay));
  });
}

export function setupApplicationCompilerTest(hooks: NestedHooks) {
  setupApplicationTest(hooks);
  clearCache(hooks);
  setupDelay(hooks);
}
