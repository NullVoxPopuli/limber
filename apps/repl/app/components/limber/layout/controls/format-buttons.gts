import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import { type ItemSignature,ToggleGroup } from 'ember-primitives/components/toggle-group';

import type { TOC } from '@ember/component/template-only';
import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';
import type { Format } from 'limber/utils/messaging';

export const FormatButtons: TOC<{}> = <template>
    <style>
      .limber__toggle-group {
        button {
          box-shadow: 0 0px 1px rgba(255,255,255,0.5);
        }
        button:hover {
          box-shadow: 0 0px 4px rgba(255,255,255,0.4);
        }
        button:focus-visible, button:focus {
          z-index: 1;
        }
      }
    </style>

    <ToggleGroup class="flex limber__toggle-group" as |t|>

      {{#let (component Option item=t.Item) as |Option|}}

        <Option @value="glimdown" @description="Glimdown">
          GDM
        </Option>
        <Option @value="gjs" @description="Glimmer JS">
          GJS
        </Option>
        <Option @value="hbs" @description="Template">
          HBS
        </Option>

      {{/let}}

    </ToggleGroup>
  </template>;

class Option extends Component<{
  Element: HTMLButtonElement;
  Args: {
    item: ComponentLike<ItemSignature>
    value: Format
    description: string
  };
  Blocks: { default: []}
  }> {
  @service declare router: RouterService;

  active = (format: Format) => {
    return this.format === format ? "bg-[#333] text-white" : 'bg-ember-black text-white';
  }

  switch = (format: Format): void => {
    this.router.transitionTo({ queryParams: { format } });
  };

  get format(): Format {
    return this.router.currentRoute?.queryParams?.format as Format;
  }

  <template>
    <@item
      @value={{@value}}
      {{on "click" (fn this.switch @value)}}
      aria-label={{@description}}
      title={{@description}}
      class="relative
        px-2 py-1 -my-1
        text-left
        transition ease-in-out duration-150
        sm:text-sm
        drop-shadow-md hover:drop-shadow-xl
        focus:ring-4 focus-visible:outline-none ring-ember-brand focus:outline-none
        focus-visible:rounded focus:rounded
        {{this.active @value}}"
      ...attributes
    >
      {{yield}}
    </@item>

  </template>;
}
