import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { waitFor } from '@ember/test-waiters';

import { getFromLabel, NAMES } from 'limber/snippets';
import Menu from './menu';

import type EditorService from 'limber/services/editor';

export default class DemoSelect extends Component {
  @service declare editor: EditorService;

  demos = NAMES;

  @action
  @waitFor
  async select(demoName: string) {
    let demo = await getFromLabel(demoName);

    this.editor.updateDemo(demo);
  }

  <template>
    <Menu data-test-demo-select ...attributes>
      <:trigger as |menu|>
        <span class="grid grid-flow-col gap-2 items-center">
          Select demo
          {{#if menu.isOpen}}
            <FaIcon @icon="angle-up" class="min-w-3" />
          {{else}}
            <FaIcon @icon="angle-right" class="min-w-3" />
          {{/if}}
        </span>
      </:trigger>

      <:options as |Item|>
        {{#each this.demos as |demoName|}}
          <Item {{on 'click' (fn this.select demoName)}} data-test-demo>
            {{demoName}}
          </Item>
        {{/each}}
      </:options>
    </Menu>
  </template>
}
