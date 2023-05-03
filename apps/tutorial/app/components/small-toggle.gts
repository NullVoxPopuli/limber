import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { on } from '@ember/modifier';
import { Button, service } from 'limber-ui';
import { TOC } from '@ember/component/template-only';

export const SmallScreenToggle: TOC<{ Element: HTMLButtonElement }> = <template>
  {{#let (service 'docs') as |docs|}}

    <Button {{on 'click' docs.toggleProse}} class='drop-shadow-md' ...attributes>
      {{#if docs.isViewingProse}}
        <FaIcon @icon='angles-left' />
      {{else}}
        <FaIcon @icon='angles-right' />
      {{/if}}
    </Button>

  {{/let}}
</template>;
