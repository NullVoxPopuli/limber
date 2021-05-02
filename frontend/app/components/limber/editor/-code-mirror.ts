import { assert } from '@ember/debug';

import { modifier } from 'ember-could-get-used-to-this';

import type { NamedArgs, PositionalArgs } from './-types';
import type { EditorView } from '@codemirror/view';

export default modifier(
  (element: HTMLElement, [value, updateText]: PositionalArgs, named: NamedArgs) => {
    assert(`Expected CODEMIRROR to exist`, CODEMIRROR);

    element.innerHTML = '';

    let { view, setText } = CODEMIRROR(element, value, updateText);

    named.setValue((text) => {
      setText(text); // update the editor
      updateText(text); // update the service / URL
    });

    return () => view.destroy();
  }
);

let CODEMIRROR:
  | undefined
  | ((
      element: HTMLElement,
      ...args: PositionalArgs
    ) => { view: EditorView; setText: (text: string) => void });

export async function setupCodeMirror() {
  if (CODEMIRROR) return;

  // TypeScript doesn't have a way to type files in the public folder
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  CODEMIRROR = (await import('/codemirror/preconfigured.js')).default;
}
