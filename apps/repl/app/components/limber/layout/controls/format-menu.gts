
import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

import Menu from 'limber/components/limber/menu';

import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

export class FormatMenu extends Component<{ Element: HTMLButtonElement }> {
  @service declare router: RouterService;

  switch = (format: Format) => this.router.transitionTo({ queryParams: { format } });

  <template>
    <Menu>
      <:trigger as |t|>
        <t.Button title='Change document language' ...attributes>
          <FaIcon @icon='cog' />
        </t.Button>
      </:trigger>

      <:options as |Item|>
        <Item {{on 'click' (fn this.switch 'glimdown')}}>
          Glimdown
        </Item>

        <Item {{on 'click' (fn this.switch 'gjs')}}>
          Glimmer JS
        </Item>

        <Item {{on 'click' (fn this.switch 'hbs')}}>
          Template
        </Item>
      </:options>
    </Menu>
  </template>
}
