import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { waitFor } from '@ember/test-waiters';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faAngleRight, faAngleUp } from '@fortawesome/free-solid-svg-icons';

import Menu from '#components/menu.gts';

import { getFromLabel, NAMES } from 'limber/snippets';

import type RouterService from '@ember/routing/router-service';
import type EditorService from 'limber/services/editor';

export class DemoSelect extends Component {
  @service declare editor: EditorService;
  @service declare router: RouterService;

  @action
  @waitFor
  async select(demoName: string) {
    const demo = await getFromLabel(demoName);

    this.editor.updateDemo(demo, 'glimdown');
  }

  <template>
    <Menu @inline={{true}}>
      <:trigger as |t|>
        <t.Default data-test-demo-select as |menu|>
          <span class="grid grid-flow-col items-center gap-2">
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
        {{#each NAMES as |demoName|}}
          <Item {{on "click" (fn this.select demoName)}} data-test-demo>
            {{demoName}}
          </Item>
        {{/each}}
      </:options>
    </Menu>
  </template>
}

export default DemoSelect;
