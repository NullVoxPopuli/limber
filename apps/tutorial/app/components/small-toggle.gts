import { on } from '@ember/modifier';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import { service } from 'ember-primitives/helpers/service';

import { Button } from '@nullvoxpopuli/limber-shared';

import type { TOC } from '@ember/component/template-only';

export const SmallScreenToggle: TOC<{ Element: HTMLButtonElement }> = <template>
  {{#let (service "docs") as |docs|}}

    <Button {{on "click" docs.toggleProse}} class="drop-shadow-md" ...attributes>
      {{#if docs.isViewingProse}}
        <FaIcon @icon={{faAnglesLeft}} />
      {{else}}
        <FaIcon @icon={{faAnglesRight}} />
      {{/if}}
    </Button>

  {{/let}}
</template>;
