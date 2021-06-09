import { isDestroyed, isDestroying, registerDestructor } from '@ember/destroyable';
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
      console.warn(
        `No argument was passed to {{highlight-code-blocks}}. Updates won't be detected`
      );
    }

    let hljs = await getHighlighter();

    if (this.isSafe && this.element) {
      let elements = this.element.querySelectorAll('pre > code');

      for (let element of elements) {
        hljs.highlightElement(element as HTMLElement);
        addCopyButton(this, element as HTMLElement);
      }
    }
  }
}

const copyButtonClasses = [
  'absolute',
  'top-3',
  'right-4',
  'px-2',
  'py-1',
  'rounded-sm',
  'bg-white',
  'text-black',
  'text-sm',
  'focus:ring-4',
  'focus-visible:outline-none',
  'ring-ember-brand',
  'focus:outline-none',
];

// eslint-disable-next-line @typescript-eslint/ban-types
function addCopyButton(destroyable: object, preCode: HTMLElement) {
  let pre = preCode.parentElement as HTMLElement;
  let copyButton = document.createElement('button');

  pre.classList.add('relative');

  copyButton.classList.add(...copyButtonClasses);
  copyButton.setAttribute('type', 'button');
  copyButton.setAttribute('title', 'copy to clipboard');
  copyButton.innerText = '📋';
  pre.append(copyButton);

  const copy = () => navigator.clipboard.writeText(preCode.innerText);

  copyButton.addEventListener('click', copy);

  registerDestructor(destroyable, () => {
    copyButton.removeEventListener('click', copy);
  });
}
