import Service, { inject as service } from '@ember/service';

import { UrlCompression } from '@nullvoxpopuli/limber-url-compression';
import { trackedFunction } from 'ember-resources/util/function';

import { DEFAULT_SNIPPET } from 'limber/snippets';
import { type Format, formatFrom } from 'limber/utils/messaging';
import { getQP } from 'limber/utils/query-params';

import type RouterService from '@ember/routing/router-service';

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
 *  - on ctrl+c
 *    - write URL to clipboard
 */
export default class EditorText extends Service {
  @service declare router: RouterService;

  #compressor = new UrlCompression({
    onEncoded: (encoded) => {
      this.#text = encoded;
      this.#updateQPs();
    },
    onDecoded: (decoded) => {},
  });

  format: Format = 'glimdown';

  get queryParams() {
    return this.router.currentRoute?.queryParams || {};
  }

  internalText = trackedFunction(this, async () => {
    if (this.queryParams.c) {
      return await this.#compressor.decode(this.queryParams.c);
    }

    return this.queryParams.t;
  });

  get text() {
    return this.internalText.value ?? DEFAULT_SNIPPET;
  }

  /**
   * When the user presses control+s or command+s,
   * - wait for the queue to flush
   *   - copy the updated URL to the clipboard
   *   - display a message to the user that the URL is now in their clipboard
   */
  toClipboard = () => {
    navigator.clipboard.writeText(this.router.currentURL);
  };

  /**
    * Called during normal typing.
    */
  relaxedUpdate = async (rawText: string, format?: Format) => {
    this.#updateQPs(rawText, format ?? this.format);
  };

  /**
    * Called when the Demo dropdown changes its value
    */
  immediateUpdate = (rawText: string, format: Format) => {
    this.#updateQPs(rawText, format)
  };

  #updateQPs = async (rawText: string, format: Format) => {
    let encoded = await this.#compressor.encode(rawText);

    let qps = new URLSearchParams(location.search);

    qps.set('c', encoded);
    qps.set('format', format);

    let base = this.router.currentURL.split('?')[0];
    let next = `${base}?${qps}`;

    this.router.replaceWith(next);
  };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'editor-text': EditorText;
  }
}

