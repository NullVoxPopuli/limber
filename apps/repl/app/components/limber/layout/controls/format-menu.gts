import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

import Menu from 'limber/components/limber/menu';

import {
  FileEmber,
  FileGlimmer,
  FileMarkdown,
  FileMermaid,
  FileReact,
  FileSvelte,
  FileVue,
  NestedMarkdown,
} from './icons.gts';

import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

function abbreviationFor(format: Format) {
  return format === 'glimdown' ? 'gdm' : format;
}

function iconFor(format: Format): string {
  switch (format) {
    case 'glimdown':
      return 'G⬇';
    default:
      return format.toUpperCase();
  }
}

const menuIconClasses = `inline-block w-8 text-center`;

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
      .menu-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      .glimdown-markdown {
        position: absolute;
        top: 1rem;
        left: 1.5rem;
      }
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
        <Item
          {{on "click" (fn this.switch "glimdown")}}
          class="menu-item {{this.isSelected 'glimdown'}}"
        >
          <div class={{menuIconClasses}}>
            {{{FileGlimmer}}}
            <span class="glimdown-markdown">{{{NestedMarkdown}}}</span>
          </div>
          Glimdown
        </Item>

        <Item {{on "click" (fn this.switch "md")}} class="menu-item {{this.isSelected 'md'}}">
          <div class={{menuIconClasses}}>{{{FileMarkdown}}}</div>
          Markdown
        </Item>

        <Item {{on "click" (fn this.switch "gjs")}} class="menu-item {{this.isSelected 'gjs'}}">
          <div class={{menuIconClasses}}>{{{FileGlimmer}}}</div>
          Glimmer JS
        </Item>

        <Item {{on "click" (fn this.switch "hbs")}} class="menu-item {{this.isSelected 'hbs'}}">
          <div class={{menuIconClasses}}>{{{FileEmber}}}</div>
          Template
        </Item>

        <Item
          {{on "click" (fn this.switch "svelte")}}
          class="menu-item {{this.isSelected 'svelte'}}"
        >
          <div class={{menuIconClasses}}>{{{FileSvelte}}}</div>
          Svelte
        </Item>

        <Item {{on "click" (fn this.switch "vue")}} class="menu-item {{this.isSelected 'vue'}}">
          <div class={{menuIconClasses}}>{{{FileVue}}}</div>
          Vue
        </Item>

        <Item
          {{on "click" (fn this.switch "mermaid")}}
          class="menu-item {{this.isSelected 'mermaid'}}"
        >
          <div class={{menuIconClasses}}>{{{FileMermaid}}}</div>
          Mermaid
        </Item>

        <Item
          {{on "click" (fn this.switch "jsx" "react")}}
          class="menu-item {{this.isSelected 'jsx' 'react'}}"
        >
          <div class={{menuIconClasses}}>{{{FileReact}}}</div>
          JSX | React
        </Item>
      </:options>
    </Menu>
  </template>
}
