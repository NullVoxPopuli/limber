import { getOwner } from '@ember/application';
import Helper from '@ember/component/helper';

import type { Registry } from '@ember/service';

interface Signature<Key extends keyof Registry> {
  Args: {
    Positional: [Key];
  };
  Return: Registry[Key];
}

export default class GetService<Key extends keyof Registry> extends Helper<Signature<Key>> {
  compute([name]: [string]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getOwner(this) as any) /* TYPE IS INCORRECT */
      .lookup(`service:${name}`);
  }
}
