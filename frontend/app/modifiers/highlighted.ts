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

    let { value } = hljs.highlight(code, { language: target.classList[0] });

    target.innerHTML = purify.sanitize(value);
  })();
});
