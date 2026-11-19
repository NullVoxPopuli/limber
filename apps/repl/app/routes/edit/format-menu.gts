import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

import Menu from '#components/menu.gts';
import { formatQPFrom, infoFor } from '#languages';

import { snippetForFormat } from 'limber/snippets';
import { getStoredDocumentForFormat, getStoredFilesForFormat } from 'limber/utils/editor-text';

import type { TOC } from '@ember/component/template-only';
import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';
import type { Format, FormatQP } from '#app/languages.gts';
import type EditorService from '#app/services/editor.ts';

/**
 * The document of the new format is what the user last wrote in it,
 * or a sample when they never used it.
 * Text that the user edited stays, because they can write a document
 * and then pick its format.
 */
export async function switchFormat(editor: EditorService, value: string): Promise<void> {
  const qp = formatQPFrom(value);

  if (editor.didDocChange) {
    editor.updateFormat(qp);

    return;
  }

  const stored = getStoredDocumentForFormat(qp);

  if (stored !== null) {
    editor.load(stored, qp, getStoredFilesForFormat(qp));

    return;
  }

  editor.load(await snippetForFormat(qp), qp);
}

const IconItem: TOC<{
  Args: {
    format: string;
    onClick: (format: FormatQP, flavor: string | undefined) => void;
    item: ComponentLike<{ Element: HTMLButtonElement; Blocks: { default: [] } }>;
  };
}> = <template>
  {{#let (infoFor @format) as |info|}}
    {{! @glint-expect-error I got too strict with the types here, or need to get stricter with format/flavor }}
    <@item {{on "click" (fn @onClick @format)}} class="menu-item">
      <info.icon />
      {{info.name}}
    </@item>
  {{/let}}
</template>;

export class FormatMenu extends Component<{ Element: HTMLButtonElement }> {
  @service declare router: RouterService;
  @service declare editor: EditorService;

  switch = (format: FormatQP): Promise<void> => switchFormat(this.editor, format);

  get format(): Format {
    return this.router.currentRoute?.queryParams?.format as Format;
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
        box-shadow: 0 0px 1px rgba(255, 255, 255, 0.5);
        &:hover {
          box-shadow: 0 0px 4px rgba(255, 255, 255, 0.4);
        }
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
        <t.Button
          title="Change document language"
          class="menu-trigger ring-ember-brand px-2 py-1 text-white drop-shadow-md ease-in-out hover:drop-shadow-xl focus:rounded focus-visible:rounded sm:text-sm relative bg-[#333] text-left transition duration-150 select-none focus:ring-4 focus:outline-none focus-visible:outline-none"
          ...attributes
        >
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
          <Button @format="html" />
          <Button @format="gjs" />
          <Button @format="gts" />
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
