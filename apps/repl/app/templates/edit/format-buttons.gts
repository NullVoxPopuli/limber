import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import { type ItemSignature, ToggleGroup } from 'ember-primitives/components/toggle-group';

import { usage } from '#app/languages.gts';

import { defaultSnippetForFormat } from 'limber/snippets';
import { getStoredDocumentForFormat } from 'limber/utils/editor-text';

import { FormatMenu } from './format-menu.gts';

import type { TOC } from '@ember/component/template-only';
import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';
import type { FormatQP } from '#app/languages.gts';
import type EditorService from 'limber/services/editor';

const buttonClasses = `
ring-ember-brand relative px-2 py-1 text-left drop-shadow-md transition duration-150 ease-in-out hover:drop-shadow-xl focus:rounded focus:outline-none focus:ring-4 focus-visible:rounded focus-visible:outline-none sm:text-sm
text-white
select-none
`;

const top2 = usage.top2();

function toUpper(ext: string) {
  return ext.toUpperCase();
}

export const FormatButtons: TOC<object> = <template>
  <ToggleGroup class="limber__toggle-group flex" as |t|>

    {{#let (component Option item=t.Item) as |Option|}}

      {{#each top2 as |info|}}
        <Option
          @value={{info.formatQP}}
          @description={{info.name}}
          class="hidden md:inline-block"
        >{{toUpper info.ext}}</Option>
      {{/each}}
    {{/let}}

    <FormatMenu class="{{buttonClasses}} bg-[#333]" />

  </ToggleGroup>

  <style>
    .limber__toggle-group {
      button {
        box-shadow: 0 0px 1px rgba(255, 255, 255, 0.5);
      }
      button:hover {
        box-shadow: 0 0px 4px rgba(255, 255, 255, 0.4);
      }
      button:focus-visible,
      button:focus {
        z-index: 1;
      }
    }
  </style>
</template>;

class Option extends Component<{
  Element: HTMLButtonElement;
  Args: {
    item: ComponentLike<ItemSignature>;
    value: string;
    description: string;
  };
  Blocks: { default: [] };
}> {
  @service declare router: RouterService;
  @service declare editor: EditorService;

  active = (format: string) => {
    return this.format === format ? 'bg-[#333] text-white' : 'bg-ember-black text-white';
  };

  /**
   * Because most of the formats are not cross-compatible with each other,
   * we'll want to also swap the document
   */
  switch = (value: FormatQP): void => {
    const stored = getStoredDocumentForFormat(value);

    this.editor.fileURIComponent.set(stored ?? defaultSnippetForFormat(value), value);
  };

  get format(): FormatQP {
    return this.router.currentRoute?.queryParams?.format as FormatQP;
  }

  <template>
    <@item
      @value={{@value}}
      {{on "click" (fn this.switch @value)}}
      aria-label={{@description}}
      title={{@description}}
      class="{{buttonClasses}} {{this.active @value}}"
      ...attributes
    >
      {{yield}}
    </@item>
  </template>
}
