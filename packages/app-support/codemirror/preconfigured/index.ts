import { completionKeymap } from '@codemirror/autocomplete';
import { indentWithTab } from '@codemirror/commands';
import { markdownKeymap } from '@codemirror/lang-markdown';
import { syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorSelection, EditorState } from '@codemirror/state';
import { keymap, ViewPlugin } from '@codemirror/view';
import { basicSetup, EditorView } from 'codemirror';
// @ts-ignore
import { foldByIndent } from 'codemirror-lang-mermaid';

import { HorizonSyntaxTheme } from './horizon-syntax-theme';
import { HorizonTheme } from './horizon-ui-theme';

type Format =
  | 'glimdown'
  | 'gjs'
  | 'hbs'
  | 'gdm'
  | 'gmd'
  | 'svelte'
  | 'vue'
  | 'md'
  | 'jsx'
  | 'jsx|react'
  | 'mermaid'
  | 'react';

/**
 * TODO: make this async so we can await-import all the language support packages
 */
export default async function newEditor(
  element: HTMLElement,
  value: string,
  format: Format,
  updateText: (text: string) => void
) {
  let languageConf = new Compartment();
  let tabSize = new Compartment();

  let updateListener = EditorView.updateListener.of(({ state, docChanged }) => {
    if (docChanged) {
      updateText(state.doc.toString());
    }
  });

  async function languageForFormat(format: Format) {
    // @ts-ignore
    const { glimdown, codeLanguages } = await import('codemirror-lang-glimdown');

    switch (format) {
      case 'glimdown':
      case 'gdm':
      case 'gmd':
        return glimdown();
      case 'gjs':
        // @ts-ignore
        const { gjs } = await import('codemirror-lang-glimmer-js');

        return gjs();
      case 'hbs':
        const { glimmer } = await import('codemirror-lang-glimmer');

        return glimmer();
      case 'svelte':
        const { svelte } = await import('@replit/codemirror-lang-svelte');

        return svelte();
      case 'vue':
        const { vue } = await import('@codemirror/lang-vue');

        return vue();
      case 'md':
        const { markdown } = await import('@codemirror/lang-markdown');
        return markdown({
          codeLanguages,
        });
      case 'jsx':
      case 'jsx|react':
        const { javascript } = await import('@codemirror/lang-javascript');

        return javascript({ jsx: true });
      case 'mermaid':
        const { mermaid } = await import('codemirror-lang-mermaid');
        return mermaid();
      // For later?
      // @ts-ignore
      case 'yaml':
        const { yaml } = await import('@codemirror/lang-yaml');

        return yaml();
      default:
        throw new Error(`Unrecognized format: ${format}`);
    }
  }

  async function supportForFormat(format: Format) {
    switch (format) {
      case 'gdm':
      case 'gmd':
      case 'glimdown':
        // @ts-ignore
        const { gjs } = await import('codemirror-lang-glimmer-js');

        return [gjs().support];
      case 'gjs':
      case 'hbs':
      case 'vue':
      case 'svelte':
      case 'md':
      case 'jsx':
      case 'jsx|react':
      case 'react':
      case 'mermaid':
        return []; // these include their support
      default:
        throw new Error(`Unrecognized format: ${format}`);
    }
  }

  const [language, support] = await Promise.all([
    languageForFormat(format),
    supportForFormat(format),
  ]);

  let doc = document.createElement('div');
  doc.textContent = 'Press escape to tab out';

  let view = new EditorView({
    parent: element,
    state: EditorState.create({
      // doc: value,
      extensions: [
        // features
        basicSetup,
        foldByIndent(),
        // Language
        language,
        ...support,

        updateListener,
        EditorView.lineWrapping,
        // EditorView.focusChangeEffect((state, focusing) => {
        //   view.dom.nextSibling?.appendChild(doc);
        //   return [];
        // }),

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        keymap.of([
          // Intentionally do not capture the tab key -- otherwise we can't leave the editor.
          indentWithTab,
          ...completionKeymap,
          ...markdownKeymap,
        ]),
        tabIndicator,

        // lsp,

        // Theme
        HorizonTheme,
        syntaxHighlighting(HorizonSyntaxTheme),
      ],
    }),
  });

  let setText = async (text: string, format: Format) => {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: text,
      },
      effects: languageConf.reconfigure(await languageForFormat(format)),
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
      // languageConf.reconfigure(languageForFormat(format)),
    ],
  });

  return { view, setText };
}
