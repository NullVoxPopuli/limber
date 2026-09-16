import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import { H3, snippet } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

const usage = `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();

const file = \`graph LR
    A[Square Rect] -- Link text --> B((Circle))
    A --> C(Round Rect)
    B --> D{Rhombus}
    C --> D
\`;

const { element, destroy } = await compiler.compile(
  'mermaid',
  file,
  { /* options */ });
`;

export const MERMAID = <template>
  <H3 @id="format-mermaid">mermaid</H3>

  <p>
    <ExternalLink href="https://mermaid.js.org/">Mermaid</ExternalLink>
    is a diagramming tool that supports many types of diagrams.

    <snippet.js @code={{usage}} />
  </p>
</template> satisfies SimpleComponent;
