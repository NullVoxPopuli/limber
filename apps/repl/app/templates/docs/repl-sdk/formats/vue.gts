import { H3 } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

export const VUE = <template>
  <H3 @id="format-vue">vue</H3>

  <p>
    text here
  </p>
</template> satisfies SimpleComponent;
