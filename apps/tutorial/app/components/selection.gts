import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { service } from '@ember/service';
import { on } from '@ember/modifier';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

import type RouterService from '@ember/routing/router-service';
import type DocsService from 'tutorial/services/docs';

/**
  * Converts 1-2-hyphenated-thing
  * to
  *   Hyphenated Thing
  */
const titleize = (str: string) => {
  return str
    .split('-')
    .filter(text => !Boolean(text.match(/^[\d]+$/)))
    .map(text => `${text[0] && text[0].toLocaleUpperCase()}${text.slice(1, text.length)}`)
    .join(' ');
}

export class Selection extends Component {
  @service declare docs: DocsService;
  @service declare router: RouterService;

  get humanSelected() {
    let path = this.docs.selected?.path;

    if (!path) return;

    return path.split('/').filter(Boolean).map(titleize).join(' / ');
  }

  handleChange = (event: Event) => {
    assert(`Target must be select element`, event.target instanceof HTMLSelectElement);

    this.router.transitionTo(event.target.value);
  }

  isSelected = ({ path }: { path: string }) => {
    return this.docs.selected?.path === path;
  }

  <template>
    <label class="w-full relative">
      <span class="sr-only">Change tutorial</span>
      <span class="w-full h-full px-4 absolute z-1 sr-hidden pointer-events-none grid gap-3 grid-flow-col items-center justify-start">
        <FaIcon @icon="bars" />
        <span>{{this.humanSelected}}</span>
      </span>

      <select
        name="tutorial"
        class="bg-none border border-gray-900 font-lg rounded p-2 w-full indent-[-100000px]"
        {{on "change" this.handleChange}}
      >
        {{#each-in this.docs.grouped as |group tutorials|}}
          <optgroup label={{titleize group}}>
            {{#each tutorials as |tutorial|}}
              <option value={{tutorial.path}} selected={{this.isSelected tutorial}}>
                {{titleize tutorial.name}}
              </option>
            {{/each}}
          </optgroup>
        {{/each-in}}
      </select>
    </label>
  </template>
}
