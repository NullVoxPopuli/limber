import { hash } from '@ember/helper';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ContainerQuery from 'ember-container-query/components/container-query';
import aspectRatio from 'ember-container-query/helpers/cq-aspect-ratio';

import constrainVertically from 'limber/modifiers/constrain-vertically';

interface Signature {
  Blocks: {
    default: [boolean, () => void];
  }
}

export class Orientation extends Component<Signature> {
  @tracked forcedAlternate?: boolean;

  rotate = () => this.forcedAlternate = !this.forcedAlternate;
  reset = (_splitHorizontallyQuery: boolean) => {
    (async () => {
      // Delay so that we don't infinite loop, since we consume
      // forcedAlternate during render
      await Promise.resolve();
      this.forcedAlternate = undefined;
    })();
  }

  intent = (splitHorizontallyQuery: boolean) => {
    return this.forcedAlternate ?? splitHorizontallyQuery;
  }

  <template>
    <ContainerQuery
      @features={{hash horizontalSplit=(aspectRatio max=1.2)}}
      {{! grid forces all the contents to take up all available vertical space }}
      class="grid"
      {{constrainVertically}}
      as |query|
    >

      {{#let query.features.horizontalSplit as |splitHorizontally|}}

        {{ (this.reset splitHorizontally) }}

        {{yield (this.intent splitHorizontally) this.rotate}}

      {{/let}}

    </ContainerQuery>
  </template>
}

