/* eslint-disable ember/classic-decorator-no-classic-methods */
import { isDestroyed, isDestroying, registerDestructor } from '@ember/destroyable';
import { inject as service } from '@ember/service';
import { buildWaiter } from '@ember/test-waiters';
import { isTesting, macroCondition } from '@embroider/macros';

import { compressToEncodedURIComponent } from 'lz-string';

import { fileFromParams, type Format, formatFrom } from 'limber/utils/messaging';

import type RouterService from '@ember/routing/router-service';

const DEBOUNCE_MS = 300;
const queueWaiter = buildWaiter('FileURIComponent::queue');
const queueTokens: unknown[] = [];

export async function shortenUrl(url: string) {
  let response = await fetch(`https://api.nvp.gg/v1/links`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ originalUrl: url }),
  });

  let json = await response.json();
  let shortUrl = json.data.attributes.shortUrl;

  // fake our custom domain
  // Will be done for us later
  return shortUrl.replace('nvp.gg', 'share.glimdown.com');
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
export class FileURIComponent {
  @service declare router: RouterService;

  #initialFile = fileFromParams();
  #text = this.#initialFile.text;

  get format() {
    let location = this.#currentURL();

    let search = location.split('?')[1];
    let queryParams = new URLSearchParams(search);

    return formatFrom(queryParams.get('format'));
  }

  constructor() {
    registerDestructor(this, () => {
      clearTimeout(this.#timeout);
      queueTokens.forEach((token) => queueWaiter.endAsync(token));
    });
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
  toClipboard = async () => {
    this.#flush();

    let url = location.origin + this.router.currentURL;

    if (window.location.href.includes('glimdown.com')) {
      try {
        url = await shortenUrl(url);
      } catch (e) {
        console.error(`Could not shorten the URL`);
        console.error(e);
      }
    }

    await navigator.clipboard.writeText(url);
  };

  /**
   * Called during normal typing.
   */
  set = (rawText: string, format: Format) => {
    this.#updateQPs(rawText, format);
  };

  /**
   * Force the format - handy when supporting
   * old legacy URLs that are out in the wild.
   * Today, both format and text are required whenever
   * talking about what should be rendered / placed in the editor.
   */
  forceFormat = (format: Format) => {
    this.set(this.decoded ?? '', format);
  };

  #timeout?: ReturnType<typeof setTimeout>;
  #queuedFn?: () => void;

  queue = (rawText: string, format: Format) => {
    this.set(rawText, format);
  };

  #flush = () => {
    if (this.#timeout) clearTimeout(this.#timeout);

    this.#queuedFn?.();
  };

  #currentURL = () => {
    // On initial load,
    // we may not have a currentURL, because the first transition has yet to complete
    let base = this.router.currentURL;

    if (macroCondition(isTesting())) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      base ??= (this.router as any) /* private API? */?.location;
    } else {
      base ??= window.location.toString();
    }

    return base ?? window.location.toString();
  };

  #frame?: number;
  #qps: URLSearchParams | undefined;
  #tokens: unknown[] = [];
  #updateQPs = async (rawText: string, format: Format) => {
    this.#tokens.push(queueWaiter.beginAsync());
    this.#_updateQPs(rawText, format);
  };

  #cleanup = () => {
    this.#tokens.forEach((token) => {
      queueWaiter.endAsync(token);
    });
  };

  #_updateQPs = async (rawText: string, format: Format) => {
    if (this.#frame) cancelAnimationFrame(this.#frame);

    let encoded = compressToEncodedURIComponent(rawText);
    let qps = new URLSearchParams(location.search);

    qps.set('c', encoded);
    qps.delete('t');
    qps.set('format', formatFrom(format));

    // @ts-expect-error this works
    if (this.#qps?.c === qps.get('c') && this.#qps?.format === qps.get('format')) {
      // no-op, we should not have gotten here
      // it's a mistake to have tried to have update QPs.
      // Someone should debug this.
      this.#cleanup();

      return;
    }

    localStorage.setItem('format', formatFrom(format));
    localStorage.setItem('document', rawText);

    this.#qps = {
      ...this.#qps,
      ...qps,
    };

    this.#frame = requestAnimationFrame(async () => {
      if (isDestroyed(this) || isDestroying(this)) {
        this.#cleanup();

        return;
      }

      /**
       * Debounce so we are kinder on the CPU
       */
      await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS));

      if (isDestroyed(this) || isDestroying(this)) {
        this.#cleanup();

        return;
      }

      // On initial load, if we call #updateQPs,
      // we may not have a currentURL, because the first transition has yet to complete
      let base = this.router.currentURL?.split('?')[0];

      if (macroCondition(isTesting())) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        base ??= (this.router as any) /* private API? */?.location?.path;
        // @ts-expect-error private api
        base = base.split('?')[0];
      } else {
        base ??= window.location.pathname;
      }

      /**
       * At some point this added qps
       * we don't want them though, so we'll strip them
       */

      let next = `${base}?${qps}`;

      this.router.replaceWith(next);
      this.#text = rawText;
      this.#cleanup();
    });
  };
}
