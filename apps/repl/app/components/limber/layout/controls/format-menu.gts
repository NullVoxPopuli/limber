import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

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
    case 'mermaid':
      return `🧜‍♀️`;
    case 'react':
      return '⚛️';
    default:
      return format.toUpperCase();
  }
}

const menuIconClasses = `inline-block bg-ember-black text-white text-xs px-1 rounded w-8 text-center`;

export class FormatMenu extends Component<{ Element: HTMLButtonElement }> {
  @service declare router: RouterService;

  switch = (format: Format, flavor: string | undefined): void => {
    this.router.transitionTo({ queryParams: { format, flavor } });
  };

  isSelected = (format: Format, flavor?: Event | string) => {
    const fmt = abbreviationFor(this.format);

    if (typeof flavor === 'string') {
      return fmt === format && this.flavor === flavor;
    }

    return fmt === format;
  };

  get format(): Format {
    return this.router.currentRoute?.queryParams?.format as Format;
  }

  get flavor(): string | undefined {
    return this.router.currentRoute?.queryParams?.flavor;
  }

  <template>
    <style>
      .menu-icon {
        transition: 0.25s all;
        &.upside-down {
          transform: rotate(180deg);
        }
      }
    </style>
    <Menu>
      <:trigger as |t|>
        <t.Button title="Change document language" ...attributes>
          {{iconFor this.format}}
          <FaIcon @icon={{faCaretDown}} class="menu-icon {{if t.isOpen 'upside-down'}}" />
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

        <Item {{on "click" (fn this.switch "svelte")}} class="{{this.isSelected 'svelte'}}">
          <div class={{menuIconClasses}}>{{iconFor "svelte"}}</div>
          Svelte
        </Item>

        <Item {{on "click" (fn this.switch "vue")}} class="{{this.isSelected 'vue'}}">
          <div class={{menuIconClasses}}>{{iconFor "vue"}}</div>
          Vue
        </Item>

        <Item {{on "click" (fn this.switch "mermaid")}} class="{{this.isSelected 'mermaid'}}">
          <div class={{menuIconClasses}}>{{iconFor "mermaid"}}</div>
          Mermaid
        </Item>

        <Item
          {{on "click" (fn this.switch "jsx" "react")}}
          class="{{this.isSelected 'jsx' 'react'}}"
        >
          <div class={{menuIconClasses}}>{{iconFor "react"}}</div>
          JSX | React
        </Item>
      </:options>
    </Menu>
  </template>
}
