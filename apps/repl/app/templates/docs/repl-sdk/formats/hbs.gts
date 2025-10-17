import { H3 } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

export const HBS = <template>
  <H3 @id="format-hbs">hbs</H3>

  <p>
    text here
  </p>
</template> satisfies SimpleComponent;
