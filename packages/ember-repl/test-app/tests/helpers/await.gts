import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { waitForPromise } from '@ember/test-waiters';

import type { ComponentLike } from '@glint/template';

interface Args {
  promise: Promise<ComponentLike | undefined>;
}

export class Await extends Component<Args> {
  @tracked resolved?: ComponentLike;
  @tracked error?: Error;

  constructor(owner: unknown, args: Args) {
    super(owner, args);

    let promise = args.promise
      .then((resolved) => {
        if (isDestroying(this) || isDestroyed(this)) return;

        this.resolved = resolved;
      })
      .catch((error) => {
        if (isDestroying(this) || isDestroyed(this)) return;

        this.error = error;
        this.resolved = undefined;
      });

    waitForPromise(promise);
  }

  get isPending() {
    return !this.resolved;
  }

  <template>
    {{#if this.error}}
      Error:
      {{this.error.toString}}
    {{else if this.isPending}}
      Building...
    {{else}}
      <this.resolved />
    {{/if}}
  </template>
}
