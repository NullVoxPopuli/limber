import { guidFor } from '@ember/object/internals';

import { modifier } from 'ember-modifier';

import { isAllowedFormat } from '#app/languages.gts';

import { highlightToHtml } from './index.ts';

interface Signature {
  Element: HTMLElement;
  Args: {
    Positional: [string | null];
  };
}

export const highlighted = modifier<Signature>((element: Element, [code]) => {
  if (!code) return;

  const guid = guidFor(element);

  element.setAttribute('id', guid);

  let lang = element.getAttribute('data-format') ?? element.classList[0]!;

  lang = lang.replace('language-', '');

  if (lang === 'glimdown') {
    lang = 'markdown';
  }

  const isAllowed = isAllowedFormat(lang) || lang === 'bash';

  if (!isAllowed) {
    return;
  }

  lang = lang.split('|')[0]!;

  (async () => {
    const html = await highlightToHtml(code, lang);

    // because the above is async, it's possible that the element
    // has been removed from the DOM
    if (!html || !document.getElementById(guid)) {
      return;
    }

    element.innerHTML = html;
  })();
});
