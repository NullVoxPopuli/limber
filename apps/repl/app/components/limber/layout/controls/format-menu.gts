import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import Menu from 'limber/components/limber/menu';

import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

function abbreviationFor(format: Format) {
  return format === 'glimdown' ? 'gdm' : format;
}

export class FormatMenu extends Component<{ Element: HTMLButtonElement }> {
  @service declare router: RouterService;

  switch = (format: Format): void => {
    this.router.transitionTo({ queryParams: { format } });
  };

  isSelected = (format: Format) => {
    let fmt = abbreviationFor(this.format);

    return fmt === format;
  }

  get format(): Format {
    return this.router.currentRoute?.queryParams?.format as Format;
  }

  <template>
    <Menu>
      <:trigger as |t|>
        <t.Button title="Change document language" ...attributes>
          {{abbreviationFor this.format}}
        </t.Button>
      </:trigger>

      <:options as |Item|>
        <Item {{on "click" (fn this.switch "glimdown")}} class="{{this.isSelected "glimdown"}}">
          Glimdown
        </Item>

        <Item {{on "click" (fn this.switch "gjs")}} class="{{this.isSelected "gjs"}}">
          Glimmer JS
        </Item>

        <Item {{on "click" (fn this.switch "hbs")}} class="{{this.isSelected "hbs"}}">
          Template
        </Item>
      </:options>
    </Menu>
  </template>
}
