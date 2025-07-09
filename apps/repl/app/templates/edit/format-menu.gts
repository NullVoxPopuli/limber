import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

import Menu from '#components/menu.gts';
import { formatQPFrom, infoFor, usage } from '#languages';

import type { TOC } from '@ember/component/template-only';
import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';
import type { Format, FormatQP } from '#app/languages.gts';
import type EditorService from '#app/services/editor.ts';

function abbreviationFor(format: Format) {
  return format === 'glimdown' ? 'gmd' : format;
}

const IconItem: TOC<{
  Args: {
    format: string;
    onClick: (format: FormatQP, flavor: string | undefined) => void;
    item: ComponentLike<{ Element: HTMLButtonElement; Blocks: { default: [] } }>;
  }
}> = <template>
  {{#let (infoFor @format) as |info|}}
    <@item {{on "click" (fn @onClick @format)}} class="menu-item">
      <info.icon />
      {{info.name}}
    </@item>
  {{/let}}
</template>;


export class FormatMenu extends Component<{ Element: HTMLButtonElement }> {
  @service declare router: RouterService;
  @service declare editor: EditorService;

  switch = (format: FormatQP): void => {
    usage.track(format);
    this.editor.fileURIComponent.format = format;
  };

  isSelected = (format: Format) => {
    const fmt = abbreviationFor(this.format);

    return fmt === format;
  };

  get format(): Format {
    return this.router.currentRoute?.queryParams?.format as Format;
  }

  get flavor(): string | undefined {
    return this.router.currentRoute?.queryParams?.flavor as string | undefined;
  }

  @cached
  get currentInfo() {
    if (!this.format) return;

    const format = formatQPFrom(this.format);

    return infoFor(format);
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
          {{#if this.currentInfo}}
            <this.currentInfo.icon />
            <span>{{this.currentInfo.name}}</span>
          {{else}}
            <span>Select</span>
          {{/if}}
          <FaIcon @icon={{faCaretDown}} class="menu-icon {{if t.isOpen 'upside-down'}}" />
        </t.Button>
      </:trigger>

      <:options as |Item|>
        {{#let (component IconItem item=Item onClick=this.switch) as |Button|}}
          <Button @format="gmd" />
          <Button @format="md" />
          <Button @format="js" />
          <Button @format="gjs" />
          <Button @format="hbs" />
          <Button @format="svelte" />
          <Button @format="vue" />
          <Button @format="mermaid" />
          <Button @format="jsx|react" />
        {{/let}}
      </:options>
    </Menu>
  </template>
}
