import { isDestroyed, isDestroying } from '@ember/destroyable';
import { action } from '@ember/object';

import { Modifier } from 'ember-could-get-used-to-this';
// import { getEditor } from 'limber/monaco';
// import * as monaco from 'monaco-editor';

export default class Highlighted extends Modifier {
  get isSafe() {
    return !isDestroyed(this) && !isDestroying(this);
  }

  get code() {
    return this.args.positional[0];
  }

  setup() {
    this.highlight(this.code);
  }

  update() {
    this.highlight(this.code);
  }

  @action
  async highlight(code) {
    let [hljs, purify] = await Promise.all([getHighlighter(), getPurifier()]);

    if (this.isSafe && this.element) {
      let target = this.element.querySelector('code');
      let { value } = hljs.highlight(code, { language: this.element.classList[0] });

      target.innerHTML = purify.sanitize(value);
    }
  }
}

let HIGHLIGHT;

async function getHighlighter() {
  if (HIGHLIGHT) return HIGHLIGHT;

  HIGHLIGHT = (await import('highlight.js')).default;

  return HIGHLIGHT;
}

let PURIFY;

async function getPurifier() {
  if (PURIFY) return PURIFY;

  PURIFY = (await import('dompurify')).default;

  return PURIFY;
}
