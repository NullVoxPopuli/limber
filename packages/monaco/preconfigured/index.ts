import * as Monaco from 'monaco-editor';

import { HorizonTheme } from './horizon-theme';
import { extendLanguages } from './syntax';
import { insertStyles, insertStylesheet } from './utils';

import type * as monaco from 'monaco-editor';

const CSS = '/monaco/editor.main.css';
const OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  language: 'markdown',
  lineNumbers: 'off',
  theme: 'vs-dark',
  wordWrap: 'bounded',
  wrappingIndent: 'indent',
  automaticLayout: true,
  scrollBeyondLastLine: false,
  fontFamily: 'inherit',
  // fontsize seems arbitrary -- there may be
  // some scaling going on?
  fontSize: 16,
  lineHeight: 24,
  minimap: {
    enabled: false,
  },
};

const FONT = `
@font-face {
  font-family: 'codicon';
  src: url('/monaco/codicon-JE4GZACF.ttf') format('truetype');
}
`;

export default function setupEditor(
  element: HTMLElement,
  value: string,
  updateText: (text: string) => void
) {
  configureWorkerPaths();
  insertStyles(CSS);
  insertStylesheet(FONT);

  Monaco.editor.defineTheme('horizon', HorizonTheme);

  extendLanguages(Monaco);

  let editor = Monaco.editor.create(element, {
    ...OPTIONS,
    showFoldingControls: 'mouseover',
    value,
    theme: 'horizon',
    automaticLayout: true,
  });

  editor.onDidChangeModelContent(() => {
    updateText(editor.getValue());
  });

  let setText = (text: string) => {
    editor.setValue(text);
  };

  return { editor, setText };
}

function configureWorkerPaths() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: unknown, label: string) {
      if (label === 'json') {
        return '/monaco/language/json/json.worker.js';
      }

      if (label === 'css' || label === 'scss' || label === 'less') {
        return '/monaco/language/css/css.worker.js';
      }

      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return '/monaco/language/html/html.worker.js';
      }

      if (label === 'typescript' || label === 'javascript') {
        return '/monaco/language/typescript/ts.worker.js';
      }

      return '/monaco/editor/editor.worker.js';
    },
  };
}
