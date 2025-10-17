import { H3 } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

export const JS = <template>
  <H3 @id="format-js">js</H3>

  <p>
    text here
  </p>
</template> satisfies SimpleComponent;
