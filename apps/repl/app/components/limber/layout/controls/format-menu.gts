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

function iconFor(format: Format): string {
  switch (format) {
    case 'glimdown':
      return 'G⬇';
    case 'gjs':
      return 'GJS';
    case 'hbs':
      return 'HBS';
  }
}

const menuIconClasses = `inline-block bg-ember-black text-white text-xs px-1 rounded w-8 text-center`;

export class FormatMenu extends Component<{ Element: HTMLButtonElement }> {
  @service declare router: RouterService;

  switch = (format: Format): void => {
    this.router.transitionTo({ queryParams: { format } });
  };

  isSelected = (format: Format) => {
    let fmt = abbreviationFor(this.format);

    return fmt === format;
  };

  get format(): Format {
    return this.router.currentRoute?.queryParams?.format as Format;
  }

  <template>
    <Menu>
      <:trigger as |t|>
        <t.Button title="Change document language" ...attributes>
          {{iconFor this.format}}
        </t.Button>
      </:trigger>

      <:options as |Item|>
        <Item {{on "click" (fn this.switch "glimdown")}} class="{{this.isSelected 'glimdown'}}">
          <div class={{menuIconClasses}}>{{iconFor "glimdown"}}</div>
          Glimdown
        </Item>

        <Item {{on "click" (fn this.switch "gjs")}} class="{{this.isSelected 'gjs'}}">
          <div class={{menuIconClasses}}>{{iconFor "gjs"}}</div>
          Glimmer JS
        </Item>

        <Item {{on "click" (fn this.switch "hbs")}} class="{{this.isSelected 'hbs'}}">
          <div class={{menuIconClasses}}>{{iconFor "hbs"}}</div>
          Template
        </Item>
      </:options>
    </Menu>
  </template>
}
