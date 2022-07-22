import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';

import { getQP } from 'limber/utils/query-params';

import { DEFAULT_SNIPPET } from 'limber/snippets';

import type RouterService from '@ember/routing/router-service';

export default class EditorService extends Service {
  @service declare router: RouterService;

  errorOnLoad = getQP('e');

  @tracked isCompiling = false;
  @tracked error?: string;

  declare _editorSwapText: (text: string) => void;

  text = getQP() ?? DEFAULT_SNIPPET;

  @action
  updateText(text: string) {
    this.text = text;
    debounce(this, this._updateSnippet, 300);
  }

  @action
  updateDemo(text: string) {
    this._editorSwapText(text);
  }

  @action
  swapText(callback: (text: string) => void) {
    this._editorSwapText = callback;
  }

  @action
  _updateSnippet() {
    let qps = buildQP(this.text);
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
function buildQP(rawText: string) {
  const params = new URLSearchParams(location.search);

  params.set('t', rawText);

  return params;
}
