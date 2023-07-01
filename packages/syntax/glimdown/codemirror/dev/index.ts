import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';

import { glimdown } from '../dist/';

const testDoc = `# Title 

{{array 1 2}}

<!-- comment -->

- list 
- items 
- here

\`\`\`hbs 
<p>{{two}}</p>

<ul>
  {{#each (array 1 2) as |item|}}
    <li>{{item}}</li>
  {{/each}}
</ul>

<style>
  p {
    color: red;
  }
</style>
\`\`\`

\`\`\`gjs 
const two = 2;

<template>
  <p>{{two}}</p>

  <style>
    p {
      color: red;
    }
  </style>
</template>
\`\`\`

\`\`\`gts 
const two: number = 2;

<template>
  <p>{{two}}</p>

  <style>
    p {
      color: red;
    }
  </style>
</template>
\`\`\`
`;

const doc = testDoc;

// Text Input
export const mainView = new EditorView({
  state: EditorState.create({
    doc,
    extensions: [
      basicSetup,
      glimdown(),
      // We can't use HTML as the hosting language
      // (to overlay Glimmer on top of)
      // Because in Glimmer, we can have spaces within double curlies,
      // and in the HTML parser, this ends up escaping the attribute valuse, and other things
      // htmlLanguage,
      oneDark,
      EditorView.lineWrapping,
    ],
  }),
  parent: document.querySelector('#editor'),
});
