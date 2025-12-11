import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import { H4, snippet } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

const usage = `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();

const { element, destroy } = await compiler.compile(
  'hbs',
  '... file contents ...',
  {
    flavor: 'ember',
    /* options */
  });
`;

export const HBSEmber = <template>
  <H4 @id="format-hbs-ember">hbs:ember</H4>

  <p>
    While sharing the exetnsion for handlebars, this format used by
    <ExternalLink href="https://emberjs.com/">emberjs</ExternalLink>
    is not strictly handlebars. It is both subset and superset, in that not all
    handlebars features are supported (for clarity reasons), and there are
    additional syntaxes that don't make sense in handlebars (such as component
    syntaxes).

    <snippet.js @code={{usage}} />
  </p>
</template> satisfies SimpleComponent;
