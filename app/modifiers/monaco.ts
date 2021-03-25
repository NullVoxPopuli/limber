import { modifier } from 'ember-could-get-used-to-this';
import * as monaco from 'monaco-editor';

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

export default modifier((element: HTMLElement, [value, updateText]: PositionalArgs) => {
  configureWorkerPaths();
  insertStyles();

  element.innerHTML = '';
  let editor = monaco.editor.create(element, {
    ...OPTIONS,
    showFoldingControls: 'mouseover',
    value,
  });

  fetch('/monaco/themes/onedark.json')
    .then((data) => data.json())
    .then((data) => {
      monaco.editor.defineTheme('monokai', data);
      monaco.editor.setTheme('monokai');
    });

  editor.onDidChangeModelContent(() => {
    updateText(editor.getValue());
  });

  return () => editor.dispose();
});

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
  if ((window as any).MonacoEnvironment) return;

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
