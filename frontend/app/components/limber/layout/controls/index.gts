import { assert } from '@ember/debug';
import { fn, modifier } from '@ember/helper';
import { on } from '@ember/modifier'
import { modifier as functionModifier} from 'ember-modifier';

import State, { setupResizeObserver } from './state';
import { Controls } from './buttons';

import type { TemplateOnlyComponent as TOC } from '@ember/component/template-only';
import type {
  ComponentLike,
  ModifierLike
} from "@glint/template";
import type { Send } from 'ember-statechart-component/glint';

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
