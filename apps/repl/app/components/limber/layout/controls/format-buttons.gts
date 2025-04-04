import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import { type ItemSignature, ToggleGroup } from 'ember-primitives/components/toggle-group';

import { defaultSnippetForFormat } from 'limber/snippets';
import { getStoredDocumentForFormat } from 'limber/utils/editor-text';

import type { TOC } from '@ember/component/template-only';
import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';
import type { Format } from 'limber/utils/messaging';

export const FormatButtons: TOC<object> = <template>
  {{! template-lint-disable no-forbidden-elements }}
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

  <ToggleGroup class="limber__toggle-group flex" as |t|>

    {{#let (component Option item=t.Item) as |Option|}}

      <Option @value="glimdown" @description="Glimdown">GDM</Option>
      <Option @value="gjs" @description="Glimmer JS">GJS</Option>
      <Option @value="hbs" @description="Template">HBS</Option>

    {{/let}}

  </ToggleGroup>
</template>;

class Option extends Component<{
  Element: HTMLButtonElement;
  Args: {
    item: ComponentLike<ItemSignature>;
    value: Format;
    description: string;
  };
  Blocks: { default: [] };
}> {
  @service declare router: RouterService;
  @service declare editor: EditorService;

  active = (format: Format) => {
    return this.format === format ? 'bg-[#333] text-white' : 'bg-ember-black text-white';
  };

  /**
   * Because most of the formats are not cross-compatible with each other,
   * we'll want to also swap the document
   */
  switch = (format: Format): void => {
    const stored = getStoredDocumentForFormat(format);

    this.editor.fileURIComponent.set(stored ?? defaultSnippetForFormat(format), format);
    // this.router.transitionTo({ queryParams: { format,  } });
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
      class="ring-ember-brand relative -my-1 px-2 py-1 text-left drop-shadow-md transition duration-150 ease-in-out hover:drop-shadow-xl focus:rounded focus:outline-none focus:ring-4 focus-visible:rounded focus-visible:outline-none sm:text-sm
        {{this.active @value}}"
      ...attributes
    >
      {{yield}}
    </@item>
  </template>
}
