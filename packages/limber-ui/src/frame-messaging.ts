import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { waitFor, waitForPromise } from '@ember/test-waiters';

import { modifier } from 'ember-modifier';
import { connectToChild } from 'penpal';

import type { ModifierLike } from '@glint/template';
import type { Connection } from 'penpal';

/**
 * The messages between a page and the REPL in its frame.
 *
 * There are two such pairs. `<REPL>` frames the edit page,
 * and the edit page frames the output page for a pinned ember-source.
 * Both pairs use these types.
 */
export interface FrameDocument {
  code: string;
  format: string;
  /**
   * The files next to `code`, as path → text.
   * `undefined` keeps what the frame has.
   */
  files?: Record<string, string>;
  /**
   * `undefined` keeps what the frame has.
   */
  shadowdom?: undefined | boolean | string;
  /**
   * Pins, as package name → version.
   */
  versions?: Record<string, string>;
}

export interface GuestMethods {
  update: (document: FrameDocument) => void;
}

export interface HostMethods {
  /**
   * The packages that the frame loaded, after each compile.
   */
  dependencies: (
    entries: [name: string, version: string | undefined][]
  ) => void;
}

/**
 * We can't post right away, because we might do so before the iframe is ready.
 * We need to wait until the frame initiates contact.
 */
function PostMessage(
  handleUpdate: (data: FrameDocument) => void
): ModifierLike<{
  Element: HTMLIFrameElement;
  Args: {
    Positional: [data: FrameDocument];
  };
}> {
  return modifier((element: HTMLIFrameElement, [data]: [FrameDocument]) => {
    // In SSR (happy-dom), contentWindow exists but can't do real messaging.
    // Skip to avoid triggering @waitFor-decorated queuePayload, whose
    // connection.promise never resolves and blocks settled() indefinitely.
    if (!element.contentWindow || import.meta.env?.SSR) return;

    handleUpdate(data);
  });
}

function HandleMessage(
  createConnection: (element: HTMLIFrameElement) => () => void
): ModifierLike<{ Element: HTMLIFrameElement }> {
  return modifier((element: HTMLIFrameElement) => {
    if (import.meta.env?.SSR) return;

    return createConnection(element);
  });
}

export class HostMessaging {
  @tracked frameStatus: unknown;

  connection?: Connection<GuestMethods>;

  /**
   * We can't post right away, because we might do so before the iframe is ready.
   * We need to wait until the frame initiates contact.
   */
  postMessage = PostMessage((data) => void this.queuePayload(data));
  onMessage = HandleMessage((element) => {
    this.connection = connectToChild({
      iframe: element,
      methods: { dependencies: () => {} } satisfies HostMethods,
    });

    waitForPromise(this.connection.promise).catch(console.error);

    return () => void this.connection?.destroy();
  });

  @waitFor
  async queuePayload(data: FrameDocument) {
    await Promise.resolve();
    if (isDestroyed(this) || isDestroying(this)) return;

    if (!this.connection) return;

    const child = await this.connection.promise;

    if (isDestroyed(this) || isDestroying(this)) return;

    await child.update(data);
  }
}
