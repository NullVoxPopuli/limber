import { assert } from '@ember/debug';

import { modifier } from 'ember-could-get-used-to-this';

import type { EditorView } from '@codemirror/basic-setup';

type PositionalArgs = [string, (text: string) => void];

export default modifier(async (element: HTMLElement, [value, updateText]: PositionalArgs) => {
  assert(`Expected CODEMIRROR to exist`, CODEMIRROR);

  element.innerHTML = '';

  CODEMIRROR(element, value, updateText);
});

let CODEMIRROR: undefined | ((element: HTMLElement, ...args: PositionalArgs) => EditorView);

export async function setupCodeMirror() {
  if (CODEMIRROR) return;

  CODEMIRROR = (await import('./preconfigured')).default;
}
