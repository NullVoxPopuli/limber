import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { not } from 'tutorial/utils';

import { Link, service } from 'limber-ui';

import { Selection } from './selection';

export const Nav = <template>
  <nav class="grid gap-2 p-2 shadow grid-cols-[min-content_1fr_min-content]">
    {{#let (service "selected") as |selected|}}
      <Link href={{selected.previous}} @isDisabled={{not selected.previous}}>
        <FaIcon @icon="angle-left" />
      </Link>

      <Selection />

      <Link href={{selected.next}} @isDisabled={{not selected.next}}>
        <FaIcon @icon="angle-right" />
      </Link>
    {{/let}}
  </nav>
</template>;
