import { DEBUG } from '@glimmer/env';
import { warn } from '@ember/debug';
import { guidFor } from '@ember/object/internals';

import { modifier } from 'ember-modifier';

import { getHighlighter, getPurifier } from './-utils/highlighting';

interface Signature {
  Element: HTMLPreElement;
  Args: {
    Positional: [string];
  };
}

export default modifier<Signature>((element: Element, [code]) => {
  let guid = guidFor(element);

  element.setAttribute('id', guid);

  (async () => {
    let [hljs, purify] = await Promise.all([getHighlighter(), getPurifier()]);

    // because the above is async, it's possible that the element
    // has been removed from the DOM
    if (!document.getElementById(guid)) {
      return;
    }

    let target = element.querySelector('code');

    if (!target) return;

    if (DEBUG) {
      warn(`Cannot highlight code with undefined/null code`, Boolean(code), {
        id: 'limber.modifiers.highlighted',
      });

      if (!code) {
        console.debug({ element });

        return;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let { value } = hljs.highlight(code, { language: target.classList[0]! });

    target.innerHTML = purify.sanitize(value);
  })();
});
