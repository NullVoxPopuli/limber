import { getHighlighter } from './-utils/highlighting';

export default function highlightCodeBlocks(element: HTMLElement, _: unknown) {
  if (!_) {
    console.warn(`No argument was passed to {{highlight-code-blocks}}. Updates won't be detected`);
  }

  (async () => {
    let elements = element.querySelectorAll('pre > code');

    for (let element of elements) {
      let hljs = await getHighlighter();

      hljs.highlightElement(element as HTMLElement);
    }
  })();
}
