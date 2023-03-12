import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { service } from '@ember/service';
import { on } from '@ember/modifier';

import type RouterService from '@ember/routing/router-service';
import type DocsService from 'tutorial/services/docs';

export class Selection extends Component {
  @service declare docs: DocsService;
  @service declare router: RouterService;

  handleChange = (event: Event) => {
    assert(`Target must be select element`, event.target instanceof HTMLSelectElement);

    this.router.transitionTo(event.target.value);
  }

  isSelected = ({ path }: { path: string }) => {
    return this.docs.selected?.path === path;
  }

  <template>
    <select
      aria-label="Change tutorial"
      name="tutorial"
      class="bg-none border border-gray-900 font-lg rounded p-2"
      {{on "change" this.handleChange}}
    >
      {{#each-in this.docs.grouped as |group tutorials|}}
        <optgroup label={{group}}>
          {{#each tutorials as |tutorial|}}
            <option value={{tutorial.path}} selected={{this.isSelected tutorial}}>
              {{tutorial.name}}
            </option>
          {{/each}}
        </optgroup>
      {{/each-in}}
    </select>
  </template>
}
