import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import { H3, snippet } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

const usage = `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();

const { element, destroy } = await compiler.compile(
  'gts',
  '... file contents ...',
  { /* options */ });
`;

export const GTS = <template>
  <H3 @id="format-gts">gts</H3>

  <p>
    This is the Glimmer-flavored TypeScript syntax from
    <ExternalLink href="https://guides.emberjs.com/release/components/template-tag-format/">Ember JS</ExternalLink>.
    Types are stripped before the code runs. No type checking happens.

    <snippet.js @code={{usage}} />
  </p>
</template> satisfies SimpleComponent;
