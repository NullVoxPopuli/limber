// need to Fix something in ember-statechart-component
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { assert } from '@ember/debug';
import { fn, hash } from '@ember/helper';

import { modifier } from 'ember-modifier';

import Save from '../save';
import { EditorContainer, OutputContainer } from './containers';
import { Controls } from './controls';
import { Orientation } from './orientation';
import { ResizeHandle } from './resize-handle';
import State, { isHorizontalSplit, setupResizeObserver } from './state';

import type { TOC } from '@ember/component/template-only';
import type { Send, State as StateFor } from 'ember-statechart-component/glint';

const setupState = modifier((element: Element, [send]: [Send<unknown>]) => {
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

const resizeDirection = (horzSplit: boolean) => (horzSplit ? 'vertical' : 'horizontal');
const toBoolean = (x: unknown) => Boolean(x);
const effect = (fn: (...args: unknown[]) => void) => {
  fn();
};

const isResizable = (state: StateFor<typeof State>) => {
  return !(state.matches('hasContainer.minimized') || state.matches('hasContainer.maximized'));
};

/**
 * true for horizontally split
 * false for vertically split
 */
const containerDirection = (state: StateFor<typeof State>) => {
  if (state.matches('hasContainer.default.horizontallySplit')) {
    return true;
  }

  return isHorizontalSplit(state.context);
};

export const Layout: TOC<{
  Blocks: {
    editor: [];
    output: [];
  };
}> = <template>
  <State as |state send|>
    {{#let (containerDirection state) as |horizontallySplit|}}
      <Orientation as |isVertical|>
        {{effect (fn send "ORIENTATION" (hash isVertical=isVertical))}}

        <div
          {{! row = left to right, col = top to bottom }}
          class="{{if horizontallySplit 'flex-col' 'flex-row'}} flex overflow-hidden"
        >

          <EditorContainer
            @splitHorizontally={{horizontallySplit}}
            {{setupState send}}
          >
            <Save />
            <Controls
              @isMinimized={{state.matches "hasContainer.minimized"}}
              @isMaximized={{state.matches "hasContainer.maximized"}}
              @needsControls={{toBoolean state.context.container}}
              @splitHorizontally={{horizontallySplit}}
              @send={{send}}
            />

            {{yield to="editor"}}

          </EditorContainer>

          {{!
            Unfortunately, even if we were to use native container queries,
            we wouldn't be able to conditionally render stuff as
            native container queries are CSS only.
          }}
          {{#if (isResizable state)}}
            <ResizeHandle @direction={{resizeDirection horizontallySplit}} />
          {{/if}}

          <OutputContainer>

            {{yield to="output"}}

          </OutputContainer>
        </div>
      </Orientation>
    {{/let}}
  </State>
</template>;

export default Layout;
