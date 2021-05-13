import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets';
import { defaultKeymap } from '@codemirror/commands';
import { foldGutter, foldKeymap } from '@codemirror/fold';
import { history, historyKeymap } from '@codemirror/history';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { bracketMatching } from '@codemirror/matchbrackets';
import { rectangularSelection } from '@codemirror/rectangular-selection';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';

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
      updateListener,
      foldGutter(),
      history(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...closeBracketsKeymap,
        ...completionKeymap,
      ]),
      HorizonTheme,
      HorizonSyntaxTheme,
      markdown(),
      javascript(),
    ],
  });
}
