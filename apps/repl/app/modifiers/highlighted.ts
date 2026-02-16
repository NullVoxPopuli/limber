import { warn } from '@ember/debug';
import { guidFor } from '@ember/object/internals';
import { isDevelopingApp } from '@embroider/macros';

import { modifier } from 'ember-modifier';

import { isAllowedFormat } from '#app/languages.gts';

import { getHighlighter } from '@nullvoxpopuli/limber-shared';

interface Signature {
  Element: HTMLPreElement;
  Args: {
    Positional: [string | null];
  };
}

export default modifier<Signature>((element: Element, [code]) => {
  if (!code) return;

  const guid = guidFor(element);

  element.setAttribute('id', guid);

  (async () => {
    const hljs = await getHighlighter();

    // because the above is async, it's possible that the element
    // has been removed from the DOM
    if (!document.getElementById(guid)) {
      return;
    }

    if (isDevelopingApp()) {
      warn(`Cannot highlight code with undefined/null code`, Boolean(code), {
        id: 'limber.modifiers.highlighted',
      });

      if (!code) {
        console.debug({ element });

        return;
      }
    }

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

    const html = hljs.codeToHtml(code, { lang, theme: 'github-dark' });

    element.innerHTML = html;
  })();
});
