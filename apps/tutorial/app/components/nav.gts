import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { service } from 'ember-primitives/helpers/service';
import { not } from 'tutorial/utils';

import { Link } from '@nullvoxpopuli/limber-shared';

import { Selection } from './selection';

export const Nav = <template>
  <nav class="grid grid-cols-[min-content_1fr_min-content] gap-2 p-2 shadow">
    {{#let (service "selected") as |selected|}}
      <Link href={{selected.previous}} @isDisabled={{not selected.previous}}>
        <FaIcon @icon={{faAngleLeft}} />
      </Link>

      <Selection />

      <Link href={{selected.next}} @isDisabled={{not selected.next}}>
        <FaIcon @icon={{faAngleRight}} />
      </Link>
    {{/let}}
  </nav>
</template>;
