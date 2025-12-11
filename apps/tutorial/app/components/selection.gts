import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { isCollection } from 'kolay';
import { isNotHidden, titleize } from 'tutorial/utils';

import type RouterService from '@ember/routing/router-service';
import type DocsService from 'tutorial/services/docs';

export class Selection extends Component {
  @service declare docs: DocsService;
  @service declare router: RouterService;

  get humanSelected() {
    const path = this.docs.currentPath;

    if (!path) return;

    return path.split('/').filter(Boolean).map(titleize).join(' / ');
  }

  handleChange = (event: Event) => {
    assert(
      `Target must be select element`,
      event.target instanceof HTMLSelectElement
    );

    this.router.transitionTo(event.target.value);
  };

  isSelected = (group: { path: string }, tutorial: { path: string }) => {
    const fullPath = `/${group.path}/${tutorial.path}`;

    return this.docs.currentPath === fullPath;
  };

  <template>
    <label class="relative w-full">
      <span class="sr-only">Change tutorial</span>
      <span
        class="sr-hidden gap-3 px-4 pointer-events-none absolute z-1 grid h-full w-full grid-flow-col items-center justify-start"
      >
        <FaIcon @icon={{faBars}} />
        <span class="limber__selected">{{this.humanSelected}}</span>
      </span>
      <style>
        .limber__selected {
          text-wrap: nowrap;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      </style>

      <select
        name="tutorial"
        class="font-lg rounded border-gray-900 p-2 h-full w-full border bg-none indent-[-100000px]"
        {{on "change" this.handleChange}}
      >
        {{#each this.docs.grouped.pages as |group|}}
          {{#if (isNotHidden group)}}

            <optgroup label={{titleize group.name}}>

              {{#if (isCollection group)}}
                {{#each group.pages as |tutorial|}}
                  {{#if (isNotHidden tutorial)}}

                    <option
                      value="/{{group.path}}/{{tutorial.path}}"
                      selected={{this.isSelected group tutorial}}
                    >
                      {{titleize tutorial.name}}
                    </option>

                  {{/if}}
                {{/each}}
              {{/if}}

            </optgroup>

          {{/if}}
        {{/each}}
      </select>
    </label>
  </template>
}
