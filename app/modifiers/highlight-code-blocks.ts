import { isDestroyed, isDestroying } from '@ember/destroyable';
import { action } from '@ember/object';

import { Modifier } from 'ember-could-get-used-to-this';

import { getHighlighter } from './-utils/highlighting';

export default class HighlightCodeBlocks extends Modifier {
  get isSafe() {
    return !isDestroyed(this) && !isDestroying(this);
  }

  setup() {
    this.highlight();
  }

  @action
  async highlight() {
    let hljs = await getHighlighter();

    if (this.isSafe && this.element) {
      let elements = this.element.querySelectorAll('pre > code');

      for (let element of elements) {
        hljs.highlightElement(element);
      }
    }
  }
}
