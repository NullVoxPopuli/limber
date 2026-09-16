export const mermaid = `
graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;
`.trim();

const emberHbs = `
{{#let (Array 1 2 3) as |arr|}}
  {{arr}}
{{/let}}
`;

export const hbs = { ember: emberHbs };

const react = `
import React from 'react';

export default <>
  <h1>Hello World</h1>

  GENERAL KENOBI!
</>;
`.trim();

export const jsx = { react };

export const vue = `
<style scoped>
  h1 { color: red; }
</style>
<script setup>
  import { ref } from 'vue'

  const count = ref(0)
</script>

<template>
  <h1>Hello World</h1>

  GENERAL KENOBI!
</template>
`.trim();

export const svelte = `
<script>
	let name = 'world';
</script>
<style>
  h1 { color: red; }
</style>

<h1>Hello {name}!</h1>
`.trim();

export const gjs = ` 
const greeting = 'hello there';

<template>
  <h1>{{greeting}}</h1>

  <style>
    h1 { color: orange; }
  </style>
</template>
`.trim();

export const gts = ` 
import Component from '@glimmer/component';

interface Signature {
  Args: { greeting?: string };
}

export default class Demo extends Component<Signature> {
  get greeting(): string {
    return this.args.greeting ?? 'hello there';
  }

  <template>
    <h1>{{this.greeting}}</h1>

    <style>
      h1 { color: orange; }
    </style>
  </template>
}
`.trim();

export const md = `
# Markdown 

With the markdown compiler, all configured compilers can be used 
with their respective codefences + flavors (if applicable).

## JSX React

\`\`\`jsx react live 
${jsx.react}
\`\`\`

## Mermaid

\`\`\`mermaid
${mermaid}
\`\`\`

## Svelte 

\`\`\`svelte live
${svelte}
\`\`\`

## Vue 

\`\`\`vue live
${vue}
\`\`\`\

`.trim();
