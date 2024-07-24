export const mermaid = `
graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;
`.trim();

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
