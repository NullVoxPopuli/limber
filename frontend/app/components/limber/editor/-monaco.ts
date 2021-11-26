import { assert } from '@ember/debug';

import type { NamedArgs, PositionalArgs } from './-types';
/**
 * I wish there was a way to specify types-only packages
 * while Limber uses Monaco, it's provided by the limber-monaco
 * broccoli funnel (copied into the public folder).
 *
 * So the devDep on monaco-editor in limber/frontend is *solely*
 * for the type defs
 */
import type * as monaco from 'monaco-editor';

export default function installMonaco(
  element: HTMLElement,
  [value, updateText]: PositionalArgs,
  named: NamedArgs
) {
  assert(`Expected MONACO to exist`, MONACO);

  element.innerHTML = '';

  let { editor, setText } = MONACO(element, value, updateText);

  named.setValue((text) => {
    // changing the text this ways calls updateText for us
    // updateText(text); // update the service / URL
    setText(text); // update the editor
  });

  return () => editor?.dispose();
}

let MONACO:
  | undefined
  | ((
      element: HTMLElement,
      ...args: PositionalArgs
    ) => { editor: monaco.editor.IStandaloneCodeEditor; setText: (text: string) => void });

export async function setupMonaco() {
  if (MONACO) return;

  // TypeScript doesn't have a way to type files in the public folder
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  MONACO = (await import('/monaco/preconfigured.js')).default;
}
