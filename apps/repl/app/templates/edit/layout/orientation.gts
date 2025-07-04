import { hash } from '@ember/helper';

import { aspectRatio, ContainerQuery } from 'ember-container-query';

import constrainVertically from 'limber/modifiers/constrain-vertically';

import type { TOC } from '@ember/component/template-only';

interface Signature {
  Blocks: {
    default: [boolean];
  };
}

export const Orientation: TOC<Signature> = <template>
  <ContainerQuery
    @features={{hash isVertical=(aspectRatio max=1.2)}}
    {{! grid forces all the contents to take up all available vertical space }}
    class="grid"
    {{constrainVertically}}
    as |query|
  >

    {{#let query.features.isVertical as |isVertical|}}

      {{yield (Boolean isVertical)}}

    {{/let}}

  </ContainerQuery>
</template>;
