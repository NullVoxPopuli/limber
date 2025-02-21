import { modifier } from 'ember-modifier';

import { getHighlighter } from './-utils/highlighting';

export default modifier((element: HTMLElement, [_]: unknown[]) => {
  if (!_) {
    console.warn(`No argument was passed to {{highlight-code-blocks}}. Updates won't be detected`);
  }

  (async () => {
    const elements = element.querySelectorAll('pre > code');

    for (const element of elements) {
      const hljs = await getHighlighter();

      hljs.highlightElement(element as HTMLElement);
    }
  })();
});
