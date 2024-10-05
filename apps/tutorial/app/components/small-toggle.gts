import { on } from '@ember/modifier';

import { faAnglesLeft,faAnglesRight } from '@fortawesome/free-solid-svg-icons';

import { Button, service } from 'limber-ui';

import type { TOC } from '@ember/component/template-only';

export const SmallScreenToggle: TOC<{ Element: HTMLButtonElement }> = <template>
  {{#let (service "docs") as |docs|}}

    <Button {{on "click" docs.toggleProse}} class="drop-shadow-md" ...attributes>
      {{#if docs.isViewingProse}}
        {{{faAnglesLeft}}}
      {{else}}
        {{{faAnglesRight}}}
      {{/if}}
    </Button>

  {{/let}}
</template>;
