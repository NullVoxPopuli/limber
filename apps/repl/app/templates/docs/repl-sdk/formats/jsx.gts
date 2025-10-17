import { H3 } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

export const JSX = <template>
  <H3 @id="format-jsx">jsx</H3>

  <p>
    text here
  </p>
</template> satisfies SimpleComponent;
