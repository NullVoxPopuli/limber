import { assert } from '@ember/debug';

import { modifier } from 'ember-could-get-used-to-this';

import type { EditorView } from '@codemirror/view';

type PositionalArgs = [string, (text: string) => void];

export default modifier(async (element: HTMLElement, [value, updateText]: PositionalArgs) => {
  assert(`Expected CODEMIRROR to exist`, CODEMIRROR);

  element.innerHTML = '';

  let editor = CODEMIRROR(element, value, updateText);

  return () => editor.destroy();
});

let CODEMIRROR: undefined | ((element: HTMLElement, ...args: PositionalArgs) => EditorView);

export async function setupCodeMirror() {
  if (CODEMIRROR) return;

  // TypeScript doesn't have a way to type files in the public folder
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  CODEMIRROR = (await import('/codemirror/preconfigured.js')).default;
}
