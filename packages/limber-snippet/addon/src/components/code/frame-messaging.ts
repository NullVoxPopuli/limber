import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { modifier } from 'ember-modifier';
import { action } from '@ember/object';
import { waitForPromise, waitFor } from '@ember/test-waiters';
import { connectToChild, type Connection } from 'penpal';

export class HostMessaging {
  @tracked frameStatus: unknown;

  connection?: Connection<{
    update: (format: string, text: string) => void;
  }>;

  /**
    * We can't post right away, because we might do so before the iframe is ready.
    * We need to wait until the frame initiates contact.
    */
  postMessage = modifier((element: HTMLIFrameElement, [data]: [string]) => {
    if (this.frameStatus !== 'ready') {}
    if (!element.contentWindow) return;

    this.queuePayload('gjs', data ?? '<template></template>');
  }
  );
  onMessage = modifier((element: HTMLIFrameElement) => {
    this.connection = connectToChild({
      iframe: element,
      methods: {
        ready: () => this.frameStatus = 'ready',
      }
    });

    waitForPromise(this.connection.promise).catch(console.error);

    return () => this.connection?.destroy();
  });


  @action
  @waitFor
  async queuePayload(format: string, text: string) {
    if (!this.connection) return;

    let child = await this.connection.promise;
    if (isDestroyed(this) || isDestroying(this)) return;

    await child.update(format, text);
  }
}
