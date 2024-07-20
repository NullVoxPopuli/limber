import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { isCollection } from 'kolay';

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
    .filter((text) => !text.match(/^[\d]+$/))
    .map((text) => `${text[0]?.toLocaleUpperCase()}${text.slice(1, text.length)}`)
    .join(' ');
};

export class Selection extends Component {
  @service declare docs: DocsService;
  @service declare router: RouterService;

  get humanSelected() {
    let path = this.docs.currentPath;

    if (!path) return;

    return path.split('/').filter(Boolean).map(titleize).join(' / ');
  }

  handleChange = (event: Event) => {
    assert(`Target must be select element`, event.target instanceof HTMLSelectElement);

    this.router.transitionTo(event.target.value);
  };

  isSelected = ({ path }: { path: string }) => {
    return this.docs.currentPath === path;
  };

  <template>
    <label class="w-full relative">
      <span class="sr-only">Change tutorial</span>
      <span
        class="w-full h-full px-4 absolute z-1 sr-hidden pointer-events-none grid gap-3 grid-flow-col items-center justify-start"
      >
        <FaIcon @icon="bars" />
        <span class="limber__selected">{{this.humanSelected}}</span>
      </span>
      <style>
        .limber__selected { text-wrap: nowrap; white-space: nowrap; text-overflow: ellipsis;
        overflow: hidden; }
      </style>

      <select
        name="tutorial"
        class="bg-none border border-gray-900 font-lg rounded p-2 w-full h-full indent-[-100000px]"
        {{on "change" this.handleChange}}
      >
        {{#each this.docs.grouped.pages as |group|}}
          <optgroup label={{titleize group.name}}>
            {{#if (isCollection group)}}
              {{#each group.pages as |tutorial|}}
                <option value={{tutorial.path}} selected={{this.isSelected tutorial}}>
                  {{titleize tutorial.name}}
                </option>
              {{/each}}
            {{/if}}
          </optgroup>
        {{/each}}
      </select>
    </label>
  </template>
}
