import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { waitFor, waitForPromise } from '@ember/test-waiters';

import { modifier } from 'ember-modifier';
import { connectToChild } from 'penpal';

import type { ModifierLike } from '@glint/template';
import type { Connection } from 'penpal';

interface ParentToChildData {
  code: string;
  format: string;
  shadowdom: undefined | boolean;
}

/**
 * We can't post right away, because we might do so before the iframe is ready.
 * We need to wait until the frame initiates contact.
 */
function PostMessage(
  handleUpdate: (data: ParentToChildData) => void
): ModifierLike<{
  Element: HTMLIFrameElement;
  Args: {
    Positional: [data: ParentToChildData];
  };
}> {
  return modifier((element: HTMLIFrameElement, [data]: [ParentToChildData]) => {
    if (!element.contentWindow) return;

    handleUpdate(data);
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
    update: (data: ParentToChildData) => void;
  }>;

  /**
   * We can't post right away, because we might do so before the iframe is ready.
   * We need to wait until the frame initiates contact.
   */
  postMessage = PostMessage((data) => void this.queuePayload(data));
  onMessage = HandleMessage((element) => {
    this.connection = connectToChild({
      iframe: element,
      methods: {},
    });

    waitForPromise(this.connection.promise).catch(console.error);

    return () => void this.connection?.destroy();
  });

  @waitFor
  async queuePayload(data: ParentToChildData) {
    await Promise.resolve();
    if (isDestroyed(this) || isDestroying(this)) return;

    if (!this.connection) return;

    const child = await this.connection.promise;

    if (isDestroyed(this) || isDestroying(this)) return;

    await child.update(data);
  }
}
