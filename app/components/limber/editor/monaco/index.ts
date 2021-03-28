import { modifier } from 'ember-could-get-used-to-this';

import { HorizonTheme } from './themes/horizon';

import type * as monaco from 'monaco-editor';

const CSS = '/monaco/editor.main.css';
const OPTIONS: monaco.editor.IEditorConstructionOptions = {
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

type PositionalArgs = [string, (text: string) => void];
interface NamedArgs {
  setValue: (callback: (text: string) => void) => void;
}

export default modifier(
  (element: HTMLElement, [value, updateText]: PositionalArgs, named: NamedArgs) => {
    let editor: monaco.editor.IStandaloneCodeEditor;

    /**
     * There is theoretically potential for a race condition
     * where the element is no longer in the DOM.
     * However, because of the logic of how this modifier is used in this app
     * this element can't be missing
     */
    (async () => {
      await setupMonaco();

      element.innerHTML = '';
      editor = MONACO.editor.create(element, {
        ...OPTIONS,
        showFoldingControls: 'mouseover',
        value,
        theme: 'horizon',
        automaticLayout: true,
      });

      editor.onDidChangeModelContent(() => {
        updateText(editor.getValue());
      });

      named?.setValue((text: string) => editor.setValue(text));
    })();

    return () => editor?.dispose();
  }
);

let MONACO: typeof monaco;

export async function setupMonaco() {
  if (MONACO) return;

  configureWorkerPaths();
  insertStyles();

  MONACO = await import('monaco-editor');

  MONACO.editor.defineTheme('horizon', HorizonTheme);
}

async function insertStyles() {
  let hasStyles = document.querySelector(`link[href="${CSS}]"`);

  if (hasStyles) return;

  let element = document.createElement('link');

  element.setAttribute('rel', 'stylesheet');
  element.setAttribute('href', CSS);

  document.body.appendChild(element);
  await Promise.resolve();
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
