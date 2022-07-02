import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce, schedule } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';
import { waitFor } from '@ember/test-waiters';

import { nameFor } from 'ember-repl';
import { DEFAULT_SNIPPET } from 'limber/snippets';
import { getQP } from 'limber/utils/query-params';

import { compile } from './-compile';

import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';

const CACHE = new Map<string, ComponentLike>();

export default class EditorService extends Service {
  @service declare router: RouterService;

  errorOnLoad = getQP('e');

  @tracked isCompiling = false;
  @tracked component?: ComponentLike;
  @tracked error: string | null = this.errorOnLoad ?? null;
  @tracked errorLine: number | null = null;
  @tracked markdownToHbs?: string;
  @tracked template?: unknown;

  declare _editorSwapText: (text: string) => void;

  text = getQP() ?? DEFAULT_SNIPPET;

  constructor(...args: Injections) {
    super(...args);

    schedule('afterRender', () => this.makeComponent());
  }

  @action
  @waitFor
  async makeComponent() {
    deleteQP('e');

    let id = nameFor(this.text);

    if (this.error !== this.errorOnLoad) {
      this.error = null;
    }

    if (CACHE.has(id)) {
      this.component = CACHE.get(id);

      return;
    }

    this.isCompiling = true;

    try {
      await this._compile(id);
    } finally {
      this.isCompiling = false;
    }
  }

  @action
  async _compile(id: string) {
    let { error, rootTemplate, rootComponent } = await compile(this.text);

    if (error) {
      console.error(error);
    }

    if (error && rootTemplate === undefined) {
      this.error = error.message;

      return;
    }

    if (error) {
      let { line } = extractPosition(error.message);

      this.error = error.message;
      this.errorLine = line;

      return;
    }

    if (rootTemplate !== undefined) {
      this.markdownToHbs = rootTemplate;
    }

    CACHE.set(id, rootComponent as ComponentLike);

    this.component = rootComponent as ComponentLike;
  }

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

    this.makeComponent();

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
  params.delete('e');

  return params;
}

function deleteQP(name: string) {
  let qps = new URLSearchParams(location.search);

  qps.delete(name);

  history.replaceState(null, document.title, `${location.origin}${location.pathname}?${qps}`);
}

function extractPosition(message: string) {
  let match = message.match(/' @ line (\d+) : column/);

  if (!match) {
    return { line: null };
  }

  let [, line] = match;

  return { line: parseInt(line, 10) };
}
