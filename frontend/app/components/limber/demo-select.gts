import Component from '@glimmer/component';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { inject as service } from '@ember/service';
import { waitFor } from '@ember/test-waiters';

// @ts-expect-error
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

import { getFromLabel, NAMES } from 'limber/snippets';
import Menu from './menu';

import type EditorService from 'limber/services/editor';
import type RouterService from '@ember/routing/router-service';

interface Signature {
  Element: HTMLElement;
}

export default class DemoSelect extends Component<Signature> {
  @service declare editor: EditorService;
  @service declare router: RouterService;

  @action
  @waitFor
  async select(demoName: string) {
    let demo = await getFromLabel(demoName);

    this.editor.updateDemo(demo, 'glimdown');
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
        {{#each NAMES as |demoName|}}
          <Item {{on 'click' (fn this.select demoName)}} data-test-demo>
            {{demoName}}
          </Item>
        {{/each}}
      </:options>
    </Menu>
  </template>
}
