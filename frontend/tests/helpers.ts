import { getContext } from '@ember/test-helpers';

import type { Registry } from '@ember/service';

export function getService<Key extends keyof Registry>(name: Key): Registry[Key] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (getContext() as any).owner /* TYPE IS INCORRECT */
    .lookup(`service:${name}`);
}
