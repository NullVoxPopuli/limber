import { completionKeymap } from '@codemirror/autocomplete';
import { indentWithTab } from '@codemirror/commands';
import { markdownKeymap } from '@codemirror/lang-markdown';
import { syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorSelection, EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { basicSetup, EditorView } from 'codemirror';
// @ts-ignore
import { glimdown } from 'codemirror-lang-glimdown';
import { glimmer } from 'codemirror-lang-glimmer';
// @ts-ignore
import { gjs } from 'codemirror-lang-glimmer-js';

import { HorizonSyntaxTheme } from './horizon-syntax-theme';
import { HorizonTheme } from './horizon-ui-theme';

export default function newEditor(
  element: HTMLElement,
  value: string,
  format: 'glimdown' | 'gjs' | 'hbs',
  updateText: (text: string) => void
) {
  let languageConf = new Compartment();
  let tabSize = new Compartment();

  let updateListener = EditorView.updateListener.of(({ state, docChanged }) => {
    if (docChanged) {
      updateText(state.doc.toString());
    }
  });

  function languageForFormat(format: 'glimdown' | 'gjs' | 'hbs') {
    switch (format) {
      case 'glimdown':
        return glimdown();
      case 'gjs':
        return gjs();
      case 'hbs':
        return glimmer();
      default:
        throw new Error(`Unrecognized format: ${format}`);
    }
  }

  function supportForFormat(format: 'glimdown' | 'gjs' | 'hbs') {
    switch (format) {
      case 'glimdown':
        return [gjs().support];
      case 'gjs':
      case 'hbs':
        return []; // these include their support
      default:
        throw new Error(`Unrecognized format: ${format}`);
    }
  }

  let view = new EditorView({
    parent: element,
    state: EditorState.create({
      // doc: value,
      extensions: [
        // features
        basicSetup,
        // Language
        languageForFormat(format),
        ...supportForFormat(format),

        updateListener,
        EditorView.lineWrapping,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        keymap.of([
          // Intentionally do not capture the tab key -- otherwise we can't leave the editor.
          indentWithTab,
          ...completionKeymap,
          ...markdownKeymap,
        ]),

        // lsp,

        // Theme
        HorizonTheme,
        syntaxHighlighting(HorizonSyntaxTheme),
      ],
    }),
  });

  let setText = (text: string, format: 'glimdown' | 'gjs' | 'hbs') => {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: text,
      },
      effects: languageConf.reconfigure(languageForFormat(format)),
    });
  };

  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: [{ from: range.from, insert: value }],
      range: EditorSelection.range(range.from, range.to),
    }))
  );

  view.dispatch({
    effects: [
      tabSize.reconfigure(EditorState.tabSize.of(2)),
      languageConf.reconfigure(languageForFormat(format)),
    ],
  });

  return { view, setText };
}
