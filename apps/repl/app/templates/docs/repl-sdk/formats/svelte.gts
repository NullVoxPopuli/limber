import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import { H3, snippet } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

const usage = `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();

const file = \`<script>
  /* ... */
</script>

<button>click</button>
\`;

const { element, destroy } = await compiler.compile(
  'mermaid',
  file,
  { /* options */ });
`;

export const SVELTE = <template>
  <H3 @id="format-svelte">svelte</H3>

  <p>
    This is the file extension for components in
    <ExternalLink href="https://svelte.dev/">Svelte</ExternalLink>.

    <snippet.js @code={{usage}} />
  </p>
</template> satisfies SimpleComponent;
