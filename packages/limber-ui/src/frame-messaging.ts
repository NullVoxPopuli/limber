import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { waitFor, waitForPromise } from '@ember/test-waiters';

import { modifier } from 'ember-modifier';
import { connectToChild } from 'penpal';

import type { ModifierLike } from '@glint/template';
import type { Connection } from 'penpal';

function isSSR(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  // @ts-expect-error process is a Node.js global, not available in browser types
  return typeof process !== 'undefined' && !!process.versions?.node;
}

interface ParentToChildData {
  code: string;
  format: string;
  shadowdom: undefined | boolean | string;
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
    // In SSR (happy-dom), contentWindow exists but can't do real messaging.
    // Skip to avoid triggering @waitFor-decorated queuePayload, whose
    // connection.promise never resolves and blocks settled() indefinitely.
    if (!element.contentWindow || isSSR()) return;

    handleUpdate(data);
  });
}

function HandleMessage(
  createConnection: (element: HTMLIFrameElement) => () => void
): ModifierLike<{ Element: HTMLIFrameElement }> {
  return modifier((element: HTMLIFrameElement) => {
    if (isSSR()) return;

    return createConnection(element);
  });
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
