import { fn } from '@ember/helper';
import { on } from '@ember/modifier'

import Icon from 'limber/components/icon';

import State from './state';

import type { InterpreterFrom } from 'xstate';

type Send = InterpreterFrom<typeof State>['send'];

const container = (element: Element, send: Send) => {
  send('CONTAINER_FOUND', { container: element as HTMLElement });

  return () => send('CONTAINER_REMOVED');
};

const Button = <template>
  <button
    type='button'
    class="
      block select-none py-2 px-3 text-white text-xs
      hover:bg-[#9b2918]
      focus:ring-4 ring-inset focus:outline-none"
    ...attributes
  >
    {{yield}}
  </button>
</template>;

const Controls = <template>
  {{#if @needsControls}}
    <div
      class='
        absolute top-0 right-0 z-[1] flex lg:grid
        {{if @isMinimized
          'bg-ember-black h-full content-start'
        }}
      '
    >
      <Button
        title={{if @isMaximized 'Back to split view' 'Maximize Editor'}}
        {{on 'click' (fn @send 'MAXIMIZE')}}
      >
        {{#if @isMaximized}}
          <Icon @name='solid/table-columns' />
        {{else}}
          <Icon @name="regular/window-maximize" />
        {{/if}}
      </Button>
      <Button
        title={{if @isMinimized 'Back to split view' 'Minimize Editor'}}
        {{on 'click' (fn @send 'MINIMIZE')}}
      >
        {{#if @isMinimized}}
          <Icon @name='solid/table-columns' />
        {{else}}
          <Icon @name='regular/window-minimize' />
        {{/if}}
      </Button>
    </div>
  {{/if}}
</template>;

<template>
  <State as |state send|>
    {{yield
      (component
        Controls
        isMinimized=(state.matches 'hasContainer.minimized')
        isMaximized=(state.matches 'hasContainer.maximized')
        needsControls=state.context.container
        send=send
      )
      (modifier container send)
    }}
  </State>
</template>

