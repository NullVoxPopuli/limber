import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { waitForPromise } from '@ember/test-waiters';

import type Owner from '@ember/owner';
import type { ComponentLike } from '@glint/template';

interface Args {
  promise: Promise<ComponentLike | undefined>;
}

export class Await extends Component<Args> {
  @tracked resolved?: ComponentLike;
  @tracked error?: Error;

  constructor(owner: Owner, args: Args) {
    super(owner, args);

    const promise = args.promise
      .then((resolved) => {
        if (isDestroying(this) || isDestroyed(this)) return;

        this.resolved = resolved;
      })
      .catch((error) => {
        if (isDestroying(this) || isDestroyed(this)) return;

        this.error = error;
        this.resolved = undefined;
      });

    void waitForPromise(promise);
  }

  get isPending() {
    return !this.resolved;
  }

  <template>
    {{#if this.error}}
      Error:
      {{String this.error}}
    {{else if this.isPending}}
      Building...
    {{else}}
      <this.resolved />
    {{/if}}
  </template>
}
