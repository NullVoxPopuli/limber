import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import { H3 } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

export const HBS = <template>
  <H3 @id="format-hbs">hbs</H3>

  <p>
    This is the extension used for
    <ExternalLink href="https://handlebarsjs.com/">Handlebars</ExternalLink>.
    Actual handlebars itself has no renderer at the moment.
  </p>
</template> satisfies SimpleComponent;
