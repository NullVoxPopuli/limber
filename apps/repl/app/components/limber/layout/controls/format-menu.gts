import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

import { flavorFrom, formatFrom, infoFor } from '#languages';

import Menu from 'limber/components/limber/menu';

import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

function abbreviationFor(format: Format) {
  return format === 'glimdown' ? 'gdm' : format;
}

const IconItem: TOC<{
  Args: {
    format: string;
    flavor: string;
    onClick: () => void;
    item: ComponentLike<{ Element: HTMLButtonElement; Blocks: { default: [] } }>;
  };
}> = <template>
  {{#let (infoFor @format @flavor) as |info|}}
    <@item {{on "click" (fn @onClick @format @flavor)}} class="menu-item">
      <info.icon />
      {{info.name}}
    </@item>
  {{/let}}
</template>;

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
        gap: 0.75rem;
      }
      .menu-trigger {
        display: grid;
        grid-auto-flow: column;
        gap: 0.75rem;
        align-items: center;
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
        <t.Button title="Change document language" ...attributes class="menu-trigger">
          {{#let (infoFor (formatFrom this.format) (flavorFrom this.flavor)) as |info|}}
            <info.icon />
            <span>{{info.name}}</span>
          {{/let}}
          <FaIcon @icon={{faCaretDown}} class="menu-icon {{if t.isOpen 'upside-down'}}" />
        </t.Button>
      </:trigger>

      <:options as |Item|>
        {{#let (component IconItem item=Item onClick=this.switch) as |Button|}}
          <Button @format="gmd" />
          <Button @format="md" />
          <Button @format="gjs" />
          <Button @format="hbs" />
          <Button @format="svelte" />
          <Button @format="vue" />
          <Button @format="mermaid" />
          <Button @format="jsx" @flavor="react" />
        {{/let}}
      </:options>
    </Menu>
  </template>
}
