import { syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';

import { printTree } from '@glimdown/codemirror-dev-preview/print-tree';

import { glimmer, glimmerLanguage } from '../dist/index.js';

const testDoc = `
  <style>
    .hello { border: 1px solid black; }
  </style>

  {{! 
    simple comment 
  }}

  just some text
  {{call expression}}


  {{!-- 
    long comment 
  --}}

  <!--
    HTML Comment
    {{not a comment}}
    {{!still a comment}}
    {{!--still a comment--}}
    -->
  
  {{foo.bar}}
  {{this.foo}}
  {{this.foo.bar}}  

  {{#let greeting as |value|}}
    {{value}}
  {{/let}}

  {{#if (nested (condition))}}
    bar
  {{else}}
    foo
  {{/if}}

  {{#unless (nested (condition))}}
    bar
  {{else}}
    foo
  {{/unless}}

    Hello {{this.name}}!

  {{log this.name}}

  {{debugger}}

  {{{purify @dangerous}}}

  {{! inline simple }}
  {{!-- inline long --}}

  <OneLine ...attributes />
  <OneLine />
  <Inline />
  <Empty 
    attribute="value" 
    foo=bar 
    bar={{foo}} 
    @arg="str" 
    @arg1={{value}}
    @arg2={{call something}}
    @arg3={{ (call something) }}
    @arg4={{ (call (nested @thing named=@arg)) }}
    {{someModifier}}
    {{someModifier 1 (two) three=(four)}}
  />
  <WithNamedBlocks @arg="str" @foo={{value}} {{on 'click' this.foo}}>
    <:loading>
      Loading...
    </:loading>
    <:resolved as |value|>
      {{value.data.property}}
    </:resolved>
  </WithNamedBlocks>

  {{hash foo="hello" bar=(component Inline arg="hi")}}
  
  {{array 1 2 @foo @bar}}

  <ul {{someModifier}}>
    {{#each (array 1 2 (concat "hi" "there")) as |item|}}
      
      <li>{{item}}</li>

    {{/each}}
  </ul>

  <button {{on 'click' handler}}>click me</button>

  <div class="string {{value}}"></div>
  <div class="string {{value}} still string"></div>
  <div class='{{if condition "class-name"}}'></div>
  <div class="{{if condition 'class-name'}}"></div>
  <div class="{{if condition "class-name"}}"></div>

  {{yield}}
  {{yield to="elsewhere"}}
  {{yield foo}}
  {{yield (hash foo="bar")}}
  {{yield (hash 
            c=(component "foo" named=2)
            m=(modifier "foo" named=2)
            h=(helper "foo" named=2)
          )}}

  {{outlet}}
`;

// const moustacheCommentTest = `
//   {{!
//     simple comment
//   }}

//   just some text
//   {{call expression}}
// `;

// const adjacentCommentsTest = `
//   {{! inline simple }}
//   {{!-- inline long --}}
// `;

// const comment = `
// <!--
//   HTML Comment
//   {{not a comment}}
//   {{!still a comment}}
//   {{!--still a comment--}}
// -->

// {{foo.bar}}
// {{#let greeting as |value|}}{{value}}{{/let}}
// <Boop {{auto-focus}}></Boop>
// `;

const doc = testDoc;
// const doc = adjacentCommentsTest;
// const doc = comment;
// const doc = moustacheCommentTest;

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
      glimmer(),
      // We can't use HTML as the hosting language
      // (to overlay Glimmer on top of)
      // Because in Glimmer, we can have spaces within double curlies,
      // and in the HTML parser, this ends up escaping the attribute valuse, and other things
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
  doc: printTree(glimmerLanguage.parser.parse(doc), doc),
  extensions: [basicSetup, oneDark, EditorView.lineWrapping, EditorState.readOnly.of(true)],
});
const glimmerTree = new EditorView({
  state: glimmerState,
  parent: document.querySelector('#editor-ast'),
});
