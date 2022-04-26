import { fn } from '@ember/helper';
import { on } from '@ember/modifier'

// @ts-expect-error
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

import State from './state';

import type { InterpreterFrom } from 'xstate';
import type { TemplateOnlyComponent as TOC } from '@ember/component/template-only';


type Send = InterpreterFrom<typeof State>['send'];

const container = (element: Element, send: Send) => {
  send('CONTAINER_FOUND', { container: element as HTMLElement });

  return () => send('CONTAINER_REMOVED');
};

const Button: TOC<{
  Element: HTMLButtonElement
  Blocks: { default: [] }
}> = <template>
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

const Controls: TOC<{
  Args: {
    needsControls: boolean
    isMinimized: boolean;
    isMaximized: boolean;
    send: Send;
  }
}> = <template>
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
          <FaIcon @icon='columns' />
        {{else}}
          <FaIcon @icon="window-maximize" @prefix='far' />
        {{/if}}
      </Button>
      <Button
        title={{if @isMinimized 'Back to split view' 'Minimize Editor'}}
        {{on 'click' (fn @send 'MINIMIZE')}}
      >
        {{#if @isMinimized}}
          <FaIcon @icon='columns' />
        {{else}}
          <FaIcon @icon='window-minimize' @prefix='far' />
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

