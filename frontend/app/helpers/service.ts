import Helper from '@ember/component/helper';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/owner';

import type { Registry } from '@ember/service';

interface Signature<Key extends keyof Registry> {
  Args: {
    Positional: [Key];
  };
  Return: Registry[Key];
}

export default class GetService<Key extends keyof Registry> extends Helper<Signature<Key>> {
  compute([name]: [Key]) {
    let owner = getOwner(this);

    assert(`Could not get owner.`, owner);

    return owner
      .lookup(`service:${name}`);
  }
}
