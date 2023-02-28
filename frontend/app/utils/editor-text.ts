import { tracked } from '@glimmer/tracking';
import Service, { inject as service } from '@ember/service';

import { Resource } from 'ember-resources';
import  { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

import { DEFAULT_SNIPPET } from 'limber/snippets';
import { formatFrom, type Format } from 'limber/utils/messaging';
import { getQP } from 'limber/utils/query-params';

import type RouterService from '@ember/routing/router-service';

interface Signature {
Args: {
  Named: {
    setEditor: (text: string, format: Format) => void;
  }
};
}

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
export class TextURIComponent extends Resource<Signature> {
  @service declare router: RouterService;

  format: Format = 'glimdown';

  #text = getInitialText();

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
    navigator.clipboard.writeText(this.router.currentURL);
  };

  /**
    * Called during normal typing.
    */
  set = (rawText: string, format?: Format) => {
    this.#updateQPs(rawText, format ?? this.format);
  };

  #updateQPs = async (rawText: string, format: Format) => {
    let encoded = compressToEncodedURIComponent(rawText);

    let qps = new URLSearchParams(location.search);

    qps.set('c', encoded);
    qps.set('format', formatFrom(format));

    let base = this.router.currentURL.split('?')[0];
    let next = `${base}?${qps}`;

    this.router.replaceWith(next);
  };
}


function getInitialText() {
  let c = getQP('c');
  let t = getQP('t');

  if (c) {
    return decompressFromEncodedURIComponent(c);
  }

  if (t) {
    return t;
  }

  return DEFAULT_SNIPPET;
}
