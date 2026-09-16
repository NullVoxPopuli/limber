import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import { H3 } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

export const JSX = <template>
  <H3 @id="format-jsx">jsx</H3>

  <p>
    This is the extension used for JSX, a style of mixed-language JavaScript, similar to GJS, but
    dominated by
    <ExternalLink href="https://legacy.reactjs.org/docs/introducing-jsx.html">React</ExternalLink>,
    and with a few othter flavors as well for
    <ExternalLink href="https://docs.solidjs.com/concepts/understanding-jsx">Solid</ExternalLink>
    ,
    <ExternalLink href="https://vuejs.org/guide/extras/render-function">Vue</ExternalLink>, and more
    (there is no standard transform for JSX, which is why a "flavor" is required").
  </p>
</template> satisfies SimpleComponent;
