import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { Link, service }  from 'limber-ui';
import { Selection } from './selection';

const not = (x: unknown) => !(x)

export const Nav = <template>
  <nav class="grid gap-2 p-2 grid-cols-[min-content_1fr_min-content]">
    {{#let (service 'selected') as |selected|}}
      <Link href={{selected.previous.path}} @isDisabled={{not selected.previous}}>
        <FaIcon @icon="angle-left" />
      </Link>

      <Selection />

      <Link href={{selected.next.path}} @isDisabled={{not selected.next}}>
        <FaIcon @icon="angle-right" />
      </Link>
    {{/let}}
  </nav>
</template>;
