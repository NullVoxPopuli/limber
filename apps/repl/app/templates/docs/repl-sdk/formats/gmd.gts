import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import { H3, snippet } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

const usage = `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();

const { element, destroy } = await compiler.compile(
  'gmd',
  \`
# Heading

\`\`\`react live
react code
\`\`\`

\`\`\`mermaid
mermaid configuration
\`\`\`

\`\`\`gjs live
glimmer/ember code
\`\`\`

\`\`\`svelte
with "live", only the code snippet is shown
\`\`\`
  \`,
  { /* options */ });
`;

export const GMD = <template>
  <H3 @id="format-gmd">gmd</H3>

  <p>
    This is the Glimmer-flavored markdown experiment that started the
    <ExternalLink href="https://limber.glimdown.com">Limber REPL</ExternalLink>. It uses
    GitHub-flavored markdown while allowing some Glimmer syntax without the need for a
    <em>live code fence</em>
    -- though live code fences are supported just as they are in regular
    <code>md</code>.

    <snippet.js @code={{usage}} />
  </p>
</template> satisfies SimpleComponent;
