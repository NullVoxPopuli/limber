import { H3 } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

export const MD = <template>
  <H3 @id="format-md">md</H3>

  <p>
    text here
  </p>
</template> satisfies SimpleComponent;
