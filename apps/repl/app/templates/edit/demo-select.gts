import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { waitFor } from '@ember/test-waiters';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faAngleRight, faAngleUp } from '@fortawesome/free-solid-svg-icons';

import { infoFor } from '#app/languages.gts';
import Menu from '#components/menu.gts';

import { ALL, type DemoEntry, getFromLabel } from 'limber/snippets';

import type RouterService from '@ember/routing/router-service';
import type EditorService from 'limber/services/editor';

export class DemoSelect extends Component {
  @service declare editor: EditorService;
  @service declare router: RouterService;

  @action
  @waitFor
  async select(demo: DemoEntry) {
    const text = await getFromLabel(demo.label);

    this.editor.updateDemo(text, demo.format);
  }

  <template>
    <Menu @inline={{true}}>
      <:trigger as |t|>
        <t.Default data-test-demo-select as |menu|>
          <span class="grid grid-flow-col items-center gap-2 whitespace-nowrap">
            Select demo

            {{#if menu.isOpen}}
              <FaIcon @icon={{faAngleUp}} class="min-w-3" />
            {{else}}
              <FaIcon @icon={{faAngleRight}} class="min-w-3" />
            {{/if}}
          </span>
        </t.Default>
      </:trigger>

      <:options as |Item|>
        {{#each ALL as |demo|}}
          <Item {{on "click" (fn this.select demo)}} data-test-demo>
            <div class="menu-item-with-icon">
              {{#let (infoFor demo.format) as |info|}}
                <info.icon />
              {{/let}}
              <span>{{demo.label}}</span>
            </div>
          </Item>
        {{/each}}
      </:options>
    </Menu>
    <style>
      .menu-item-with-icon {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }
    </style>
  </template>
}

export default DemoSelect;
