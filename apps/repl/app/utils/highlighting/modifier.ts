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

    const painted = element.querySelector('pre');

    if (!painted) {
      element.innerHTML = html;

      return;
    }

    /**
     * The browser reports a text block for Largest Contentful Paint one time only.
     * A new <pre> is a new block, and when it is larger than the first one
     * (a late web font changes the size), LCP moves to the time of the highlight.
     * So the <pre> that already painted stays, and takes the highlighted content.
     */
    const template = document.createElement('template');

    template.innerHTML = html;

    const highlightedPre = template.content.querySelector('pre');

    if (!highlightedPre) return;

    for (const { name, value } of highlightedPre.attributes) {
      painted.setAttribute(name, value);
    }

    painted.innerHTML = highlightedPre.innerHTML;
  })();
});
