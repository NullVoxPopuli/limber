import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';

import { DEFAULT_SNIPPET } from 'limber/snippets';
import { formatFrom } from 'limber/utils/messaging';
import { getQP } from 'limber/utils/query-params';

import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

export default class EditorService extends Service {
  @service declare router: RouterService;

  errorOnLoad = getQP('e');

  @tracked isCompiling = false;
  @tracked error?: string;
  @tracked errorLine?: number;
  @tracked scrollbarWidth = 0;

  _editorSwapText?: (text: string, format: Format) => void;

  text = getQP() ?? DEFAULT_SNIPPET;
  format?: Format;

  @action
  updateText(text: string) {
    /**
     * Setting these properties queues an update to the URL, debounced (usually)
     */
    this.text = text;
    debounce(this, this._updateSnippet, 300);
  }

  @action
  updateDemo(text: string, format: Format) {
    // Updates the editor
    this._editorSwapText?.(text, format);

    // Update ourselves
    this.text = text;
    this.format = format;
    this._updateSnippet();
  }

  @action
  _updateSnippet() {
    let qps = buildQP(this.text, formatFrom(this.format || getQP('format')));
    let base = this.router.currentURL.split('?')[0];
    let next = `${base}?${qps}`;

    this.router.replaceWith(next);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    editor: EditorService;
  }
}

/**
 * https://stackoverflow.com/a/57533980/356849
 * - Base64 Encoding is 33% bigger
 *
 * https://github.com/rotemdan/lzutf8.js
 * - Compression
 */
function buildQP(rawText: string, format: Format) {
  const params = new URLSearchParams(location.search);

  params.set('t', rawText);
  params.set('format', format);

  return params;
}
