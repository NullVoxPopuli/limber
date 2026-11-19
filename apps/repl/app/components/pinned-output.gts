import Component from '@glimmer/component';
import { registerDestructor } from '@ember/destroyable';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';

import { modifier } from 'ember-modifier';
import LZString from 'lz-string';
import { connectToChild } from 'penpal';

import { serializeDeps, type Versions } from 'limber/utils/dependencies';

import type Owner from '@ember/owner';
import type EditorService from 'limber/services/editor';
import type { FrameDocument, GuestMethods, HostMethods } from 'limber-ui';
import type { Connection } from 'penpal';

const { compressToEncodedURIComponent } = LZString;

type Document = FrameDocument & { versions: Versions };

/**
 * Two Embers on one page share every npm module that they both import,
 * so a pinned ember-source renders in the `/output` page in a frame.
 *
 * The text, format and pins go over penpal.
 * The frame loads again only for a new ember-source pin,
 * because a page cannot change its import map after load.
 */
export class PinnedOutput extends Component {
  @service declare editor: EditorService;

  #connection: Connection<GuestMethods> | undefined;
  #emberSource: string | undefined;

  constructor(owner: Owner, args: object) {
    super(owner, args);
    registerDestructor(this, () => this.#disconnect());
  }

  get document(): Document {
    const { format, text, versions, files } = this.editor.renderInput;

    return { format, code: text ?? '', versions, files };
  }

  /**
   * Every URL write runs this again, so the ember-source pin is compared by value.
   */
  frame = modifier((iframe: HTMLIFrameElement, [document]: [Document]) => {
    const emberSource = document.versions['ember-source'];

    if (this.#connection && emberSource === this.#emberSource) {
      void this.#send(this.#connection, document);

      return;
    }

    this.#emberSource = emberSource;
    this.#load(iframe, document);
  });

  /**
   * The URL has the whole document, so the frame renders it before penpal connects.
   */
  #load(iframe: HTMLIFrameElement, document: Document) {
    this.#disconnect();

    const qps = new URLSearchParams({
      format: document.format,
      deps: serializeDeps(document.versions) ?? '',
      c: compressToEncodedURIComponent(document.code),
    });

    if (document.files && Object.keys(document.files).length > 0) {
      qps.set('f', compressToEncodedURIComponent(JSON.stringify(document.files)));
    }

    iframe.src = `/output?${qps.toString()}`;

    this.#connection = connectToChild<GuestMethods>({
      iframe,
      methods: {
        /**
         * The frame sends the whole list after each change.
         */
        dependencies: (entries) => {
          this.editor.frameDependencies = new Map(entries);
        },
      } satisfies HostMethods,
    });
  }

  #disconnect() {
    this.#connection?.destroy();
    this.#connection = undefined;
  }

  async #send(connection: Connection<GuestMethods>, document: Document) {
    try {
      /**
       * Not a test waiter: a frame that never connects must fail a test, not hang it.
       */
      const guest = await connection.promise;

      await waitForPromise(guest.update(document));
    } catch (error) {
      /**
       * Penpal rejects the calls in flight when a new frame replaces this one.
       */
      if (connection === this.#connection) throw error;
    }
  }

  <template>
    <iframe
      title="Output"
      class="h-full w-full border-0"
      data-test-pinned-output
      {{this.frame this.document}}
    ></iframe>
  </template>
}
