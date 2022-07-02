import { assert } from '@ember/debug';

import { modifier } from 'ember-modifier';

import type { Signature } from './-types';
/**
 * I wish there was a way to specify types-only packages
 * while Limber uses Monaco, it's provided by the limber-monaco
 * broccoli funnel (copied into the public folder).
 *
 * So the devDep on monaco-editor in limber/frontend is *solely*
 * for the type defs
 */
import type * as monaco from 'monaco-editor';

export default modifier<Signature>(
  (element: Element, [value, updateText], named) => {
    assert(`Expected MONACO to exist`, MONACO);
    assert(`can only install monaco editor an an HTMLElement`, element instanceof HTMLElement);

    element.innerHTML = '';

    let { editor, setText } = MONACO(element, value, updateText, named);

    named.setValue((text) => {
      // changing the text this ways calls updateText for us
      // updateText(text); // update the service / URL
      setText(text); // update the editor
    });

    return () => editor?.dispose();
  },
  { eager: false }
);

let MONACO:
  | undefined
  | ((
      element: HTMLElement,
      value: Signature['Args']['Positional'][0],
      updateText: Signature['Args']['Positional'][1],
      named: Signature['Args']['Named']
    ) => { editor: monaco.editor.IStandaloneCodeEditor; setText: (text: string) => void });

export async function setupMonaco() {
  if (MONACO) return;

  // TypeScript doesn't have a way to type files in the public folder
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  MONACO = (await import(/* webpackIgnore: true */ '/monaco/preconfigured.js')).default;
}
