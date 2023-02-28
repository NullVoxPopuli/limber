/* eslint-disable ember/classic-decorator-no-classic-methods */
import { isDestroyed, isDestroying, registerDestructor } from '@ember/destroyable';
import { inject as service } from '@ember/service';

import { compressToEncodedURIComponent } from 'lz-string';

import { type Format, fileFromParams, formatFrom } from 'limber/utils/messaging';

import type RouterService from '@ember/routing/router-service';

const DEBOUNCE_MS = 300;

/**
 * Manages the URL state, representing the editor text.
 * Editor text may be newer than the URL state.
 *
 * Text + Format = File. The URL represents a file.
 *
 * --------------------------------------------------------------
 *
 * NOTE: that the URL (and this service) *never* sets the editor content.
 *       Editor content flows unidirectionally to the URL.
 *
 *       The only time the URL is read is on page load.
 *
 * Query Params:
 *  - t: Original URI-encoded text // original implementation
 *  - c: Compressed URI-encoded text // new implementation
 *
 * Flow:
 *  - on load:
 *    - read URL: determine if plain text or encoded (via query param)
 *      - if plain text,
 *        - write to Editor
 *      - if encoded,
 *        - decode
 *        - write to Editor
 *
 *  - on editor update:
 *    - write to URL (debounced and encoded)
 *
 *  - on ctrl+s
 *    - write URL to clipboard
 */
export class TextURIComponent {
  @service declare router: RouterService;

  #initialFile = fileFromParams();
  #text = this.#initialFile.text;
  format: Format = 'glimdown';

  constructor() {
    registerDestructor(this, () => clearTimeout(this.#timeout));
  }

  get decoded() {
    return this.#text;
  }

  /**
   * When the user presses control+s or command+s,
   * - wait for the queue to flush
   *   - copy the updated URL to the clipboard
   *   - display a message to the user that the URL is now in their clipboard
   */
  toClipboard = () => {
    this.#flush();
    navigator.clipboard.writeText(this.router.currentURL);
  };

  /**
   * Called during normal typing.
   */
  set = (rawText: string, format?: Format) => {
    this.#updateQPs(rawText, format);
  };

  #timeout?: number;
  #queuedFn?: () => void;

  /**
   * Debounce so we are kinder on the CPU
   */
  queue = (rawText: string) => {
    if (this.#timeout) clearTimeout(this.#timeout);

    this.#queuedFn = () => {
      if (isDestroyed(this) || isDestroying(this)) return;

      this.set(rawText);
      this.#queuedFn = undefined;
    };

    this.#timeout = setTimeout(this.#queuedFn, DEBOUNCE_MS);
  };

  #flush = () => {
    if (this.#timeout) clearTimeout(this.#timeout);

    this.#queuedFn?.();
  };

  #updateQPs = async (rawText: string, format?: Format) => {
    let encoded = compressToEncodedURIComponent(rawText);

    let qps = new URLSearchParams(location.search);

    qps.set('c', encoded);
    qps.set('format', formatFrom(format));

    let base = this.router.currentURL.split('?')[0];
    let next = `${base}?${qps}`;

    this.router.replaceWith(next);
  };
}
