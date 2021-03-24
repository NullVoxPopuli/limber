import { modifier } from 'ember-could-get-used-to-this';
import * as monaco from 'monaco-editor';

const CSS = '/monaco/editor.main.css';
const OPTIONS = {
  language: 'markdown',
  lineNumbers: 'off',
  theme: 'vs-dark',
  wordWrap: 'bounded',
  wrappingIndent: 'indent',
  trimAutoWhitespace: true,
  minimap: {
    enabled: false,
  },
};

export default modifier((element, [value, updateText]) => {
  configureWorkerPaths();
  insertStyles();

  let editor = monaco.editor.create(element, {
    ...OPTIONS,
    value,
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
  if (window.MonacoEnvironment) return;

  window.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
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
