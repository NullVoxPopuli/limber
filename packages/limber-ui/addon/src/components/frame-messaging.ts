import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { action } from '@ember/object';
import { waitFor, waitForPromise } from '@ember/test-waiters';

import { modifier } from 'ember-modifier';
import { type Connection, connectToChild } from 'penpal';

export class HostMessaging {
  @tracked frameStatus: unknown;

  connection?: Connection<{
    update: (format: string, text: string) => void;
  }>;

  /**
   * We can't post right away, because we might do so before the iframe is ready.
   * We need to wait until the frame initiates contact.
   */
  postMessage = modifier((element: HTMLIFrameElement, [data]: [string | null]) => {
    if (this.frameStatus !== 'ready') {
      return;
    }

    if (!element.contentWindow) return;

    if (data) {
      this.queuePayload('gjs', data);
    }
  });
  onMessage = modifier((element: HTMLIFrameElement) => {
    this.connection = connectToChild({
      iframe: element,
      methods: {
        ready: () => (this.frameStatus = 'ready'),
      },
    });

    waitForPromise(this.connection.promise).catch(console.error);

    return () => this.connection?.destroy();
  });

  @action
  @waitFor
  async queuePayload(format: string, text: string) {
    await Promise.resolve();
    if (isDestroyed(this) || isDestroying(this)) return;

    if (!this.connection) return;

    let child = await this.connection.promise;

    if (isDestroyed(this) || isDestroying(this)) return;

    await child.update(format, text);
  }
}
