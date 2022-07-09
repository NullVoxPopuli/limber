import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { EditorState } from '@codemirror/state';
import { basicSetup, EditorView } from 'codemirror';

import { HorizonSyntaxTheme } from './horizon-syntax-theme';
import { HorizonTheme } from './horizon-ui-theme';

export default function newEditor(
  element: HTMLElement,
  value: string,
  updateText: (text: string) => void
) {
  let view = new EditorView({
    parent: element,
    state: stateForValue(value, updateText),
  });

  let setText = (text: string) => {
    view.setState(stateForValue(text, updateText));
  };

  return { view, setText };
}

function stateForValue(text: string, updateText: (text: string) => void) {
  let updateListener = EditorView.updateListener.of(({ state, docChanged }) => {
    if (docChanged) {
      updateText(state.doc.toString());
    }
  });

  return EditorState.create({
    doc: text,
    extensions: [
      basicSetup,
      updateListener,
      HorizonTheme,
      HorizonSyntaxTheme,
      markdown(),
      javascript(),
    ],
  });
}
