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

const buttonClasses = `relative px-2 py-1 -my-1 text-left transition ease-in-out duration-150 sm:text-sm drop-shadow-md hover:drop-shadow-xl focus:ring-4 focus-visible:outline-none ring-ember-brand focus:outline-none focus-visible:z-1 focus-visible:rounded focus:rounded focus:z-1`

export class FormatButtons extends Component<{ Element: HTMLButtonElement }> {
  @service declare router: RouterService;

  switch = (format: Format): void => {
    this.router.transitionTo({ queryParams: { format } });
  };

  isSelected = (format: Format) => {
    let fmt = abbreviationFor(this.format);

    return fmt === format;
  };

  active = (format: Format) => {
    return this.format === format ? "bg-[#333] text-white" : 'bg-ember-black text-white';
  }

  get format(): Format {
    return this.router.currentRoute?.queryParams?.format as Format;
  }

  foo = false;

  <template>
    <style>
      .limber__toggle-group {
        button {
          box-shadow: 0 0px 1px rgba(255,255,255,0.5);
        }
        button:focus-visible, button:focus {
          z-index: 1;
        }
      }
    </style>
     <ToggleGroup class="flex limber__toggle-group" as |t|>
      <t.Item
        {{on "click" (fn this.switch "glimdown")}}
        class="rounder-l {{buttonClasses}} {{this.active 'glimdown'}}"
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
        class="rounder-r {{buttonClasses}} {{this.active 'hbs'}}"
        aria-label="Template"
        title="Template"
        @value="hbs"
      >
        HBS
      </t.Item>
    </ToggleGroup>
  </template>
}
