import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import { H3, snippet } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

const usage = `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();

const file = \`<script setup>
  /* ... */
</script>

<template>
  content here
</template>
\`;

const { element, destroy } = await compiler.compile(
  'mermaid',
  file,
  { /* options */ });
`;

export const VUE = <template>
  <H3 @id="format-vue">vue</H3>

  <p>
    This is the file extension for the components in
    <ExternalLink href="https://vuejs.org/">Vue</ExternalLink>

    <snippet.js @code={{usage}} />
  </p>
</template> satisfies SimpleComponent;
