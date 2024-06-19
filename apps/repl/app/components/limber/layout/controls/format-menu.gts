import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import { ToggleGroup } from 'ember-primitives/components/toggle-group';

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

const buttonClasses = `relative border px-2 py-1 -my-1 text-left transition ease-in-out duration-150 sm:text-sm drop-shadow-md hover:drop-shadow-xl focus:ring-4 focus-visible:outline-none ring-ember-brand focus:outline-none focus-visible:z-1 focus-visible:rounded focus:rounded focus:z-1`
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

  active = (format: Format) => {
    return this.format === format ? "bg-ember-black text-white" : 'bg-white text-black';
  }

  get format(): Format {
    return this.router.currentRoute?.queryParams?.format as Format;
  }

  foo = false;

  <template>
    <style>
      .limber__toggle-group {
      button:focus-visible {
      z-index: 1;
      }
      }
    </style>
     <ToggleGroup class="flex limber__toggle-group" as |t|>
      <t.Item 
        {{on "click" (fn this.switch "glimdown")}}
        class="rounded-l {{buttonClasses}} {{this.active 'glimdown'}}" 
        @value="glimdown" 
        aria-label="Glimdown" 
        title="Glimdown">
        GDM
      </t.Item> 
      <t.Item 
        {{on "click" (fn this.switch "gjs")}}
        class="{{buttonClasses}} {{this.active 'gjs'}}" 
        aria-label="Glimmer JS"
        title="Glimmer JS"
        @value="gjs" 
      >
        GJS
      </t.Item> 
      <t.Item 
        {{on "click" (fn this.switch "hbs")}}
        class="rounded-r {{buttonClasses}} {{this.active 'hbs'}}" 
        aria-label="Template"
        title="Template"
        @value="hbs" 
      >
        HBS
      </t.Item> 
    </ToggleGroup>

    {{#if this.foo }}
      <Menu>
        <:trigger as |t|>
          <t.Default title="Change document language" ...attributes>
            {{iconFor this.format}}
          </t.Default>
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
    {{/if}}
  </template>
}
