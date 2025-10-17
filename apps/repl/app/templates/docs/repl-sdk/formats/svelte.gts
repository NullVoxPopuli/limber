import { H3 } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

export const SVELTE = <template>
  <H3 @id="format-svelte">svelte</H3>

  <p>
    text here
  </p>
</template> satisfies SimpleComponent;
