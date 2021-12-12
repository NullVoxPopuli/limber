import { assert } from '@ember/debug';

import type { Args } from './-types';
import type { EditorView } from '@codemirror/view';

export default function codeMirror(element: HTMLElement, ...[value, updateText, named]: Args) {
  assert(`Expected CODEMIRROR to exist`, CODEMIRROR);

  element.innerHTML = '';

  let { view, setText } = CODEMIRROR(element, value, updateText, named);

  named.setValue((text) => {
    updateText(text); // update the service / URL
    setText(text); // update the editor
  });

  return () => view.destroy();
}

let CODEMIRROR:
  | undefined
  | ((
      element: HTMLElement,
      ...args: Args
    ) => { view: EditorView; setText: (text: string) => void });

export async function setupCodeMirror() {
  if (CODEMIRROR) return;

  // TypeScript doesn't have a way to type files in the public folder
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  CODEMIRROR = (await import('/codemirror/preconfigured.js')).default;
}
