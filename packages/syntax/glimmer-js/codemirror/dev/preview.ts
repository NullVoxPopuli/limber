import { syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';

import { printTree } from '@glimdown/codemirror-dev-preview/print-tree';

import { gjs, gjsLanguage } from '../dist/';

const testDoc = `
const Foo = <template>
  {{@arg}}

  <style>
    .hello { border: 1px solid black; }
  </style>
</template>;

class Bar {
  greeting = "hello world!";

  <template>
    Greeting: {{this.greeting}}!<br>
  </template>
}

const code = (text) => JSON.stringify(text, null, 4);

<template>
  <Foo @arg={{code document.body.innerHTML}} />

  <ul {{someModifier}}>
    {{#each (array 1 2 (concat "hi" "there")) as |item|}}
      
      <li>{{item}}</li>

    {{/each}}
  </ul>
</template>
`;

const doc = testDoc;

const syncAST = EditorView.updateListener.of((update) => {
  if (update.docChanged || update.selectionSet) {
    const { from: oldFrom, to: oldTo } = update.startState.selection.ranges[0];
    let { from, to } = update.state.selection.ranges[0];

    const docChanged = update.docChanged;
    const selectionChanged = !(
      (from === to && oldFrom === oldTo) ||
      (from === oldFrom && to === oldTo)
    );
    const hasSelection = from !== to;

    if (docChanged || selectionChanged) {
      const glimmerAST = printTree(
        syntaxTree(update.view.state),
        update.state.doc.toString(),
        hasSelection ? { from, to } : undefined
      );

      queueMicrotask(() => {
        glimmerTree.dispatch({
          changes: {
            from: 0,
            to: glimmerTree.state.doc.length,
            insert: glimmerAST,
          },
        });
      });
    }
  }
});

// Text Input
export const mainView = new EditorView({
  state: EditorState.create({
    doc,
    extensions: [
      basicSetup,
      gjs(),
      // We can't use HTML as the hosting language
      // (to overlay Glimmer on top of)
      // Because in Glimmer, we can have spaces within double curlies,
      // and in the HTML parser, this ends up escaping the attribute values, and other things
      // htmlLanguage,
      oneDark,
      EditorView.lineWrapping,
      syncAST,
    ],
  }),
  parent: document.querySelector('#editor'),
});

// Glimmer Tree
const glimmerState = EditorState.create({
  doc: printTree(gjsLanguage.parser.parse(doc), doc),
  extensions: [basicSetup, oneDark, EditorView.lineWrapping, EditorState.readOnly.of(true)],
});
const glimmerTree = new EditorView({
  state: glimmerState,
  parent: document.querySelector('#editor-ast'),
});
