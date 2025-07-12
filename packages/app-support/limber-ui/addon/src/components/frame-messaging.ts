import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { action } from '@ember/object';
import { waitFor, waitForPromise } from '@ember/test-waiters';

import { modifier } from 'ember-modifier';
import { connectToChild } from 'penpal';

import type { ModifierLike } from '@glint/template';
import type { Connection } from 'penpal';

/**
 * We can't post right away, because we might do so before the iframe is ready.
 * We need to wait until the frame initiates contact.
 */
function PostMessage(handleUpdate: (data: string) => void): ModifierLike<{
  Element: HTMLIFrameElement;
  Args: {
    Positional: [data: string | null];
  };
}> {
  return modifier((element, [data]: [string | null]) => {
    if (!element.contentWindow) return;

    if (data) {
      handleUpdate(data);
    }
  });
}

function HandleMessage(
  createConnection: (element: HTMLIFrameElement) => () => void
): ModifierLike<{ Element: HTMLIFrameElement }> {
  return modifier((element: HTMLIFrameElement) => createConnection(element));
}

export class HostMessaging {
  @tracked frameStatus: unknown;

  connection?: Connection<{
    update: (format: string, text: string) => void;
  }>;

  /**
   * We can't post right away, because we might do so before the iframe is ready.
   * We need to wait until the frame initiates contact.
   */
  postMessage = PostMessage((data) => void this.queuePayload('gjs', data));
  onMessage = HandleMessage((element) => {
    this.connection = connectToChild({
      iframe: element,
      methods: {},
    });

    waitForPromise(this.connection.promise).catch(console.error);

    return () => void this.connection?.destroy();
  });

  @action
  @waitFor
  async queuePayload(format: string, text: string) {
    await Promise.resolve();
    if (isDestroyed(this) || isDestroying(this)) return;

    if (!this.connection) return;

    const child = await this.connection.promise;

    if (isDestroyed(this) || isDestroying(this)) return;

    await child.update(format, text);
  }
}
