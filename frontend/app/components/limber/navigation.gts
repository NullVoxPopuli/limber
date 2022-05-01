import Component from '@glimmer/component';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import Icon from '../icon';

import isEditing from 'limber/helpers/is-editing';
import DemoSelect from './demo-select';

import type RouterService from '@ember/routing/router-service';


class TabLink extends Component<{href: string}> {
  @service declare router: RouterService;

  get isActive() {
    let routeInfo = this.router.recognize(this.args.href);

    // TODO: RFC isActive to take a whole routeInfo
    //       It's too much work to recurse up the route tree building
    //       the arguments for this otherwise.
    return this.router.isActive(routeInfo.name);
  }

  @action
  handleClick(e: MouseEvent) {
    e.preventDefault();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let qps = new URLSearchParams(this.router.currentRoute.queryParams as any);

    this.router.transitionTo(this.args.href + `?${qps}`);
  }

  <template>
    <a
      {{on 'click' this.handleClick}}
      href={{@href}}
      class="
        bg-white
        py-1 px-4 block
        hover:text-ember-light-blue focus:ring-4 ring-inset focus-visible:outline-none focus:outline-none
        rounded-t-sm
        font-medium
        {{if this.isActive
          "text-ember-blue border-b-2 border-ember-blue"
          "text-gray-600"
        }}
      "
      data-test-nav-tab
      ...attributes
    >
      {{yield}}
    </a>
  </template>
}

<template>
  <div class="grid grid-flow-col bg-ember-faint-gray gap-2" data-test-navigation>
    <nav class="flex flex-row gap-0.5 pt-0.5">
      <TabLink @href="/ember" class="relative">
        Ember
        <span class="z-10 absolute right-[-5px] inline-block">
          <Icon @name="solid/caret-right" @size="6x"/>
        </span>
      </TabLink>

      <TabLink @href="/" class="relative">
        Preview
      </TabLink>

      {{#unless (isEditing)}}
        <TabLink
          @href="/"
          class="flex gap-2 items-center border border-2"
        >
          <Icon @name="solid/pencil" @size="4x" />
          <span>Edit</span>
        </TabLink>
      {{/unless}}
    </nav>

    {{#if (isEditing)}}
      <DemoSelect class="justify-self-end self-center block sm:hidden" />
    {{/if}}
  </div>
</template>;
