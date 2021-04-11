import { isDestroyed, isDestroying } from '@ember/destroyable';
import { action } from '@ember/object';

import { Modifier } from 'ember-could-get-used-to-this';

import { getHighlighter } from './-utils/highlighting';

interface Args {
  positional: [unknown /* used to trigger updates */];
}
export default class HighlightCodeBlocks extends Modifier<Args> {
  get isSafe() {
    return !isDestroyed(this) && !isDestroying(this);
  }

  setup() {
    this.highlight();
  }

  update() {
    this.highlight();
  }

  @action
  async highlight() {
    if (!this.args.positional[0]) {
      console.warn(`No argument was passed to {{highlight-code-blocks}}. Updates won't be detected`);
    }

    let hljs = await getHighlighter();

    if (this.isSafe && this.element) {
      let elements = this.element.querySelectorAll('pre > code');

      for (let element of elements) {
        hljs.highlightElement(element);
      }
    }
  }
}
