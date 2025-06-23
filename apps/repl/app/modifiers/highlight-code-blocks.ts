import { modifier } from 'ember-modifier';

import { isAllowedFormat } from '#app/languages.gts';

import { getHighlighter } from './-utils/highlighting';

/**
 * We *could* install highlighting in to the compiler but we want to use the highlighter lazily
 * and there are many scenarios that don't need syntax highlighting on page load
 */
export default modifier((element: HTMLElement, [_]: unknown[]) => {
  if (!_) {
    console.warn(`No argument was passed to {{highlight-code-blocks}}. Updates won't be detected`);
  }

  (async () => {
    const elements = element.querySelectorAll('pre > code');

    for (const element of elements) {
      if (element.classList.contains('shiki')) continue;

      const hljs = await getHighlighter();

      const content = element.textContent;

      if (!content) continue;

      const classes = [...element.classList];
      let lang = element.getAttribute('data-format') ?? classes[0] ?? '';

      lang = lang.replace('language-', '');

      if (!isAllowedFormat(lang)) {
        console.log('lang', { lang });
        continue;
      }

      const highlighted = hljs.codeToHtml(content, {
        lang: lang,
        theme: 'github-dark',
      });

      const temp = document.createElement('div');

      temp.innerHTML = highlighted;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const highlightedCode = temp.querySelector('code')!;

      element.classList.add('shiki');
      element.classList.add('github-dark');

      element.innerHTML = highlightedCode.innerHTML;
    }
  })();
});
