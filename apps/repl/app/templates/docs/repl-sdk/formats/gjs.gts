import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import { H3, snippet } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

const usage = `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();

const { element, destroy } = await compiler.compile(
  'gjs',
  '... file contents ...',
  { /* options */ });
`;

export const GJS = <template>
  <H3 @id="format-gjs">gjs</H3>

  <p>
    This is the Glimmer-flavored JavaScript syntax from
    <ExternalLink
      href="https://guides.emberjs.com/release/components/template-tag-format/"
    >Ember JS</ExternalLink>.

    <snippet.js @code={{usage}} />
  </p>
</template> satisfies SimpleComponent;
