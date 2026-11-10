import Component from '@glimmer/component';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';

import { modifier } from 'ember-modifier';
import { connectToChild } from 'penpal';

import { serializeDeps } from 'limber/utils/dependencies';

import type EditorService from 'limber/services/editor';
import type { AsyncMethodReturns } from 'penpal';

interface Document {
  format: string;
  code: string;
}

interface Guest {
  update: (document: Document) => void;
  dependencies: () => [string, string | undefined][];
}

/**
 * Two Embers on one page share every npm module that they both import,
 * so a pinned ember-source renders in the `/output` page in a frame.
 *
 * The frame loads again when the format or a pin changes.
 * The text goes over penpal, so typing does not reload it.
 */
export class PinnedOutput extends Component {
  @service declare editor: EditorService;

  #guest: Promise<AsyncMethodReturns<Guest>> | undefined;

  /**
   * Not tracked: a new frame gets the latest text without a reload per keystroke.
   */
  #latest: Document | undefined;

  get src() {
    const { format, versions } = this.editor.renderInput;
    const qps = new URLSearchParams({ format, deps: serializeDeps(versions) ?? '' });

    return `/output?${qps.toString()}`;
  }

  get document(): Document {
    const { format, text } = this.editor.renderInput;

    return { format, code: text ?? '' };
  }

  connect = modifier((iframe: HTMLIFrameElement, [src]: [string]) => {
    iframe.src = src;

    const connection = connectToChild<Guest>({ iframe, methods: {} });

    /**
     * Not a test waiter: a frame that never connects must fail a test, not hang it.
     */
    this.#guest = connection.promise;
    void this.#send();

    const guest = this.#guest;

    this.editor.outputFrame = {
      dependencies: async () => (await guest).dependencies(),
    };

    return () => {
      this.editor.outputFrame = undefined;
      connection.destroy();
    };
  });

  send = modifier((_iframe: HTMLIFrameElement, [document]: [Document]) => {
    this.#latest = document;
    void this.#send();
  });

  async #send() {
    const guest = await this.#guest;

    if (!guest || !this.#latest) return;

    await waitForPromise(guest.update(this.#latest));
  }

  <template>
    <iframe
      title="Output"
      class="h-full w-full border-0"
      data-test-pinned-output
      {{this.connect this.src}}
      {{this.send this.document}}
    ></iframe>
  </template>
}
