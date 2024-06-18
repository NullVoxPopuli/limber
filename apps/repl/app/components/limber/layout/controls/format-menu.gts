import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import Menu from 'limber/components/limber/menu';

import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

const menuIconClasses = `inline-block bg-ember-black text-white text-xs px-1 rounded w-8 text-center`;

export class FormatMenu extends Component<{ Element: HTMLButtonElement }> {
  @service declare router: RouterService;

  switch = (format: Format): void => {
    this.router.transitionTo({ queryParams: { format } });
  };

  // Just text, but could be proper icons
  iconFor = (format: Format): string => {
    switch (format) {
      case 'glimdown':
        return 'G⬇';
      case 'gjs':
        return 'GJS';
      case 'hbs':
        return 'HBS';
    }
  };

  <template>
    <Menu>
      <:trigger as |t|>
        <t.Button title="Change document language" ...attributes>
          {{this.iconFor this.router.currentRoute.queryParams.format}}
        </t.Button>
      </:trigger>

      <:options as |Item|>
        <Item {{on "click" (fn this.switch "glimdown")}}>
          <div class={{menuIconClasses}}>{{this.iconFor "glimdown"}}</div>
          Glimdown
        </Item>

        <Item {{on "click" (fn this.switch "gjs")}}>
          <div class={{menuIconClasses}}>{{this.iconFor "gjs"}}</div>
          Glimmer JS
        </Item>

        <Item {{on "click" (fn this.switch "hbs")}}>
          <div class={{menuIconClasses}}>{{this.iconFor "hbs"}}</div>
          Template
        </Item>
      </:options>
    </Menu>
  </template>
}
