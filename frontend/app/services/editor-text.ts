import Service, { inject as service } from '@ember/service';

import { DEFAULT_SNIPPET } from 'limber/snippets';
import { type Format, formatFrom } from 'limber/utils/messaging';
import { getQP } from 'limber/utils/query-params';

import { UrlCompression } from '@nullvoxpopuli/limber-url-compression';

import type RouterService from '@ember/routing/router-service';

/**
 * Manages the URL state, representing the editor text.
 * Editor text may be newer than the URL state.
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
    onDecoded: (decoded) => {
    }
  })

  #text = getQP() ?? DEFAULT_SNIPPET;
  format?: Format;

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
   * Called when we know what the URL should be.
   */
  setTextURI = () => {};

  #updateQPs = () => {
    let qps = buildQP(this.#text, formatFrom(this.format || getQP('format')));
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

function buildQP(rawText: string, format: Format) {
  const params = new URLSearchParams(location.search);

  params.set('t', rawText);
  params.set('format', format);

  return params;
}
