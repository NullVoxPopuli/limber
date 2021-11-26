import { guidFor } from '@ember/object/internals';

import { getHighlighter, getPurifier } from './-utils/highlighting';

/**
 * NOTE: this cannot have a destructor, because it is async
 */
export default async function highlighted(element, code) {
  let guid = guidFor(element);

  element.setAttribute('id', guid);

  let [hljs, purify] = await Promise.all([getHighlighter(), getPurifier()]);

  // because the above is async, it's possible that the element
  // has been removed from the DOM
  if (!window.body.getElementById(guid)) {
    return;
  }

  let target = element.querySelector('code');
  let { value } = hljs.highlight(code, { language: target.classList[0] });

  target.innerHTML = purify.sanitize(value);
}
