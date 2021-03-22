// let EDITOR;

// window.MonacoEnvironment = {
//   getWorkerUrl: function (moduleId, label) {
//     if (label === 'json') {
//       return '/monaco/language/json/json.worker.js';
//     }
//     if (label === 'css' || label === 'scss' || label === 'less') {
//       return '/monaco/language/css/css.worker.js';
//     }
//     if (label === 'html' || label === 'handlebars' || label === 'razor') {
//       return '/monaco/language/html/html.worker.js';
//     }
//     if (label === 'typescript' || label === 'javascript') {
//       return '/monaco/language/typescript/ts.worker.js';
//     }
//     return '/monaco/editor/editor.worker.js';
//   },
// };

// export async function getEditor() {
//   if (EDITOR) return EDITOR;

//   EDITOR = await import('monaco-editor/esm/vs/editor/editor.main.js');

//   // await import('vscode-glimmer/syntaxes/inline-hbs.json');
//   // await import('vscode-glimmer/syntaxes/inline-template.json');

//   return EDITOR;
// }
