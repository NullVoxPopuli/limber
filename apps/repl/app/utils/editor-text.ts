import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { isDestroyed, isDestroying, registerDestructor } from '@ember/destroyable';
import { service } from '@ember/service';
import { buildWaiter } from '@ember/test-waiters';
import { isTesting, macroCondition } from '@embroider/macros';

import { compressToEncodedURIComponent } from 'lz-string';

import {
  flavorFrom,
  formatFrom,
  type FormatQP,
  formatQPFrom,
  isAllowedFormat,
} from '#app/languages.gts';

import { fileFromParams } from 'limber/utils/messaging';

import type RouterService from '@ember/routing/router-service';

const DEBOUNCE_MS = 250;
const queueWaiter = buildWaiter('FileURIComponent::queue');

export async function shortenUrl(url: string) {
  const response = await fetch(`https://api.nvp.gg/v1/links`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({ originalUrl: url }),
  });

  const json = await response.json();
  const shortUrl = json.data.attributes.shortUrl;

  /**
   * We don't need to replace if the REPL is on the nvp.gg domain
   */
  if (location.href.includes('glimdown.com')) {
    // fake our custom domain
    // Will be done for us later
    return shortUrl.replace('nvp.gg', 'share.glimdown.com');
  }

  return shortUrl;
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
 *
 * We do this here instead if a route, because the routing system can't be trusted :(
 */
export class FileURIComponent {
  @service declare router: RouterService;

  #initialFile = fileFromParams();

  @tracked _text = this.#initialFile.text;

  /**
   * Used so we no-op when qps match
   */
  get #currentQPs() {
    return this.router.currentRoute?.queryParams ?? ({} as Record<string, unknown>);
  }

  get #text() {
    return this._text;
  }
  set #text(value) {
    this._text = value;
  }

  get format(): FormatQP {
    const location = this.#currentURL();

    const search = location.split('?')[1];
    const queryParams = new URLSearchParams(search);

    const format = queryParams.get('format');

    if (isAllowedFormat(format)) {
      return format as FormatQP;
    }

    if (format === 'glimdown' || format === 'gdm') {
      return 'gmd';
    }

    return 'gmd';
  }
  set format(value: string) {
    this.#updateFormatQP(value);
    this.#pushUpdate();
  }

  get flavor() {
    const location = this.#currentURL();

    const search = location.split('?')[1];
    const queryParams = new URLSearchParams(search);

    return flavorFrom(this.format, queryParams.get('flavor'));
  }

  constructor() {
    registerDestructor(this, () => {
      this.#cleanup();
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
    this.flush();

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
  set = (rawText: string, format: FormatQP, extraQPs?: undefined | Record<string, string>) => {
    this.#updateFormatQP(format);
    this.#updateTextQP(rawText);

    if (extraQPs) {
      for (const [k, v] of Object.entries(extraQPs)) {
        this.#qps.set(k, v);
      }
    }

    this.#pushUpdate();
  };

  /**
   * Force the format - handy when supporting
   * old legacy URLs that are out in the wild.
   * Today, both format and text are required whenever
   * talking about what should be rendered / placed in the editor.
   */
  forceFormat = (format: FormatQP) => {
    this.#updateFormatQP(format);
    this.#pushUpdate();
  };

  queue = (rawText: string) => {
    this.#updateTextQP(rawText);
    this.#pushUpdate();
  };

  flush = async () => {
    await Promise.resolve();
    this.#setURL();
  };

  #currentURL = () => {
    // On initial load,
    // we may not have a currentURL, because the first transition has yet to complete
    // NOTE: this omits the origin. We add the origin later so we can use `new URL(..)`
    let base = this.router.currentURL;

    if (macroCondition(isTesting())) {
      base ??= (this.router as any) /* private API? */?.location?.path;
    } else {
      base ??= window.location.toString();
    }

    if (base && !base.includes(window.origin)) {
      return window.origin + base;
    }

    return base ?? window.location.toString();
  };

  #qps = new URLSearchParams();
  #tokens: unknown[] = [];

  #cleanup = () => {
    this.#qps = new URLSearchParams();
    this.#tokens.forEach((token) => {
      queueWaiter.endAsync(token);
    });
  };

  /**
   * The raw text.
   * For efficiency, we don't compress it until we are about to write to the URL
   */
  #updateTextQP = (rawText: string | undefined) => {
    this.#tokens.push(queueWaiter.beginAsync());
    this.#qps ||= new URLSearchParams();

    if (!rawText) {
      this.#qps.delete('rawText');

      return;
    }

    this.#qps.set('rawText', rawText);
    this.#qps.delete('t');
    this.#qps.delete('c');
  };

  #updateFormatQP = (format: string) => {
    this.#tokens.push(queueWaiter.beginAsync());
    this.#qps ||= new URLSearchParams();

    if (format) {
      this.#qps.set('format', formatQPFrom(format));
    }
  };

  #pushUpdate = () => {
    const rawText = this.#qps.get('rawText');

    if (rawText) {
      const format = this.#qps.get('format') ?? this.format;
      const formatQP = formatFrom(format);

      setStoredDocument(formatQP, rawText);
    }

    this.#pushUpdateToURL();
  };

  #pushUpdateToURL = makeDebounced(() => {
    if (isDestroyed(this) || isDestroying(this)) {
      this.#cleanup();

      return;
    }

    this.#setURL();
  });

  #setURL = () => {
    this.#pushUpdateToURL.clear();

    const current = this.#currentURL();
    let { pathname: base, searchParams: activeQPs } = new URL(current);

    if (base === '/') {
      base = '/edit/';
    }

    /**
     * At some point this added qps
     * we don't want them though, so we'll strip them
     */

    const rawText = this.#qps.get('rawText');
    let encoded = '';

    if (rawText) {
      encoded = compressToEncodedURIComponent(rawText);
      this.#qps.delete('rawText');
    }

    const qps = new URLSearchParams(this.#qps);

    if (encoded) {
      qps.set('c', encoded);
    }

    if (qps.size === 0) {
      this.#cleanup();
      console.debug(`No query params, not redirecting`);

      return;
    }

    if (!qps.has('format')) {
      qps.set('format', this.format);
    }

    if (!qps.has('c') && this.#text) {
      const encoded = compressToEncodedURIComponent(this.#text);

      qps.set('c', encoded);
    }

    // If either of these throw, we have something to debug.
    // Correct path execution should not result in these throwing
    assert(`Cannot update URL without required QP:format`, qps.get('format'));
    assert(`Cannot update URL without required QP:c (compressed text)`, qps.get('c'));

    /**
     * We convert to an object here because URLSearchParams returns `null`
     * when a param is missing, and we want to compare undefined when a value is missing
     */
    const q = Object.fromEntries(qps);

    if (
      q.c === this.#currentQPs.c &&
      q.t === this.#currentQPs.t &&
      q.format === this.#currentQPs.format &&
      q.shadowdom === this.#currentQPs.shadowdom
    ) {
      this.#cleanup();
      console.debug(`All query params that affect the render output are the same`);

      return;
    }

    // These are all required to be in `qps`
    activeQPs.delete('c');
    activeQPs.delete('t');
    activeQPs.delete('format');

    const nextQPs = mergeQPs(activeQPs, qps);

    const next = `${base}?${nextQPs}`;

    this.router.replaceWith(next);
    if (rawText) this.#text = rawText;

    this.#cleanup();
  };
}

function getKey(formatQP: FormatQP) {
  return `${formatQP}-doc`;
}

function decomposeKey(key: string): {
  format: string;
  flavor: string | undefined;
} {
  const notation = key.replace(/-doc$/, '');

  const parts = notation.split('|');

  assert(`Missing format`, parts[0]);

  return {
    format: parts[0],
    flavor: parts[1],
  };
}

export function setStoredDocument(formatQP: FormatQP, text: string) {
  const key = getKey(formatQP);

  localStorage.setItem('active-format', key);
  localStorage.setItem(key, text);
}

export function getStoredDocumentForFormat(formatQP: FormatQP) {
  const key = getKey(formatQP);

  return localStorage.getItem(key);
}

/**
 * We store the document per format, as well as which format
 * was last active.
 *
 * This enables us to have different documents load while changing formats
 * without fear of losing what we were working on.
 *
 * Default starting doc is
 * user-configurable.
 * (whatever they did last)
 *
 */
export function getStoredDocument() {
  const active = localStorage.getItem('active-format');

  if (active) {
    const key = `${active}-doc`;
    const activeDoc = localStorage.getItem(key);

    if (activeDoc) {
      const decomposed = decomposeKey(key);

      return { format: decomposed.format, flavor: decomposed.flavor, doc: activeDoc };
    }
  }

  // fallback to the prior implemenntation so we don't break
  // existing users.
  const format = localStorage.getItem('format');
  const doc = localStorage.getItem('document');

  return { format, doc };
}

/**
 * Don't invoke a function if we try to invoke again within
 * the timeout.
 */
function makeDebounced(fu: () => void) {
  let timeout: number;

  function runner() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fu();
    }, DEBOUNCE_MS);
  }

  runner.clear = () => clearTimeout(timeout);

  return runner;
}

function mergeQPs(...qps: URLSearchParams[]) {
  const result = Object.assign({}, ...qps.map((qp) => Object.fromEntries(qp)));

  return new URLSearchParams(result);
}
