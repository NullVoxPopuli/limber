import { assert } from '@ember/debug';
import { fn, modifier } from '@ember/helper';
import { on } from '@ember/modifier'
import not from 'limber/helpers/not';
import { modifier as functionModifier} from 'ember-modifier';

// @ts-expect-error
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

import State, { setupResizeObserver } from './state';

import type { TemplateOnlyComponent as TOC } from '@ember/component/template-only';
import type {
  ComponentLike,
  ModifierLike
} from "@glint/template";
import type { Send } from 'ember-statechart-component/glint';

const Button: TOC<{
  Element: HTMLButtonElement
  Blocks: { default: [] }
}> = <template>
  <button
    type='button'
    class="
      block select-none py-2 px-3 text-white text-xs
      hover:bg-[#9b2918]
      focus:ring-4 ring-inset focus:outline-none
      disabled:opacity-30
    "
    ...attributes
  >
    {{yield}}
  </button>
</template>;


const Controls: TOC<{
  Args: {
    needsControls: boolean;
    splitHorizontally: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    rotate: () => void;
    send: Send<any>;
  }
}> = <template>
  {{#if @needsControls}}
    <div
      data-is-minimized="{{@isMinimized}}"
      class="
        absolute top-0 right-0 z-[1]
        {{if @splitHorizontally
          'flex flex-row-reverse'
          'grid'
        }}
        {{if @isMinimized
          'bg-ember-black h-full content-start'
        }}
      "
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
      <Button
        title="Rotate Editor/Output orientation"
        disabled={{@isMaximized}}
        {{on 'click' @rotate}}
      >
        <FaIcon @icon='rotate' />
      </Button>
    </div>
  {{/if}}
</template>;

const toBoolean = (x: unknown) => Boolean(x);

const container = functionModifier((element: Element, [send]: [Send<unknown>]) => {
  assert(`Element is not resizable`, element instanceof HTMLElement);

  let observer = setupResizeObserver(() => send('RESIZE'));
  send('CONTAINER_FOUND', {
    container: element,
    observer,
    maximize: () => send('MAXIMIZE'),
    minimize: () => send('MINIMIZE'),
  });

  return () => send('CONTAINER_REMOVED');
});

const sendOrientation = (send: Send<unknown>, splitHorizontally: boolean) => {
  send('ORIENTATION', { splitHorizontally });
}

export const EditorControls: TOC<{
  Args: {
    splitHorizontally: boolean;
    rotate: () => void;
  };
  Blocks: {
    default: [ComponentLike, ModifierLike]
  }
}> =
  <template>
    <State as |state send|>

      {{ (sendOrientation send @splitHorizontally) }}

      {{yield
        (component
          Controls
          isMinimized=(state.matches 'hasContainer.minimized')
          isMaximized=(state.matches 'hasContainer.maximized')
          needsControls=(toBoolean state.context.container)
          splitHorizontally=@splitHorizontally
          rotate=@rotate
          send=send
        )
        (modifier container send)
      }}
    </State>
  </template>
