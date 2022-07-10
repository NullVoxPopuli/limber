import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorSelection, EditorState } from '@codemirror/state';
// import { EditorState } from '@codemirror/state';
import { basicSetup, EditorView } from 'codemirror';

import { HorizonSyntaxTheme } from './horizon-syntax-theme';
import { HorizonTheme } from './horizon-ui-theme';

export default function newEditor(
  element: HTMLElement,
  value: string,
  updateText: (text: string) => void
) {
  let updateListener = EditorView.updateListener.of(({ state, docChanged }) => {
    if (docChanged) {
      updateText(state.doc.toString());
    }
  });

  let view = new EditorView({
    parent: element,
    // state: stateForValue(value, updateText),
    extensions: [
      // features
      basicSetup,
      updateListener,
      EditorView.lineWrapping,
      // Intentionally do not capture the tab key -- otherwise we can't leave the editor.
      // keymap.of([indentWithTab]),
      // languages
      // markdown(),
      javascript(),
      // Theme
      HorizonTheme,
      syntaxHighlighting(HorizonSyntaxTheme),
    ],
  });

  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: [{ from: range.from, insert: value }],
      range: EditorSelection.range(range.from, range.to),
    }))
  );

  let tabSize = new Compartment();

  view.dispatch({
    effects: tabSize.reconfigure(EditorState.tabSize.of(2)),
  });

  let setText = (text: string) => {
    view.dispatch(
      view.state.changeByRange((range) => ({
        changes: [{ from: range.from, insert: text }],
        range: EditorSelection.range(range.from, range.to),
      }))
    );
  };

  return { view, setText };
}
