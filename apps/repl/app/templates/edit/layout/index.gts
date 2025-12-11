import { assert } from '@ember/debug';
import { fn } from '@ember/helper';

import { modifier } from 'ember-modifier';

import Save from '#components/save.gts';

import { EditorContainer, OutputContainer } from './containers.gts';
import { Controls } from './controls/index.gts';
import { Orientation } from './orientation.gts';
import { ResizeHandle } from './resize-handle.gts';
import {
  isHorizontalSplit,
  LayoutState,
  setupResizeObserver,
} from './state.ts';

import type { TOC } from '@ember/component/template-only';
import type { ReactiveActorFrom } from 'ember-statechart-component';

type ReactiveActor = ReactiveActorFrom<typeof LayoutState>;

const setupState = modifier(
  (element: Element, [send]: [(event: string) => void]) => {
    assert(`Element is not resizable`, element instanceof HTMLElement);

    const observer = setupResizeObserver(() => send('RESIZE'));

    // @ts-expect-error need to fix the type of this for ember-statechart-component
    send({
      type: 'CONTAINER_FOUND',
      container: element,
      observer,
      maximize: () => send('MAXIMIZE'),
      minimize: () => send('MINIMIZE'),
    });

    return () => send('CONTAINER_REMOVED');
  }
);

const resizeDirection = (horzSplit: boolean) =>
  horzSplit ? 'vertical' : 'horizontal';
const toBoolean = (x: unknown) => Boolean(x);
const effect = (fn: (...args: unknown[]) => void) => {
  fn();
};

const isResizable = (state: ReactiveActor) => {
  return !(
    state.matches('hasContainer.minimized') ||
    state.matches('hasContainer.maximized')
  );
};

/**
 * true for horizontally split
 * false for vertically split
 */
const containerDirection = (state: ReactiveActor) => {
  if (state.matches('hasContainer.default.horizontallySplit')) {
    return true;
  }

  return isHorizontalSplit(state.snapshot);
};

function updateOrientation(isVertical: boolean) {
  return {
    type: 'ORIENTATION',
    isVertical,
  };
}

export const Layout: TOC<{
  Blocks: {
    editor: [];
    output: [];
  };
}> = <template>
  <LayoutState as |state|>
    {{#let (containerDirection state) as |horizontallySplit|}}
      <Orientation as |isVertical|>
        {{! Normally we don't do effects in app code,
            because we can derive all state.

            But XState is an *evented* system, so we have to send events.
        }}
        {{effect (fn state.send (updateOrientation isVertical))}}

        <div
          {{! row = left to right, col = top to bottom }}
          class="{{if horizontallySplit 'flex-col' 'flex-row'}}
            flex overflow-hidden"
        >

          <EditorContainer
            @splitHorizontally={{horizontallySplit}}
            {{setupState state.send}}
          >
            <Save />
            <Controls
              @isMinimized={{state.matches "hasContainer.minimized"}}
              @isMaximized={{state.matches "hasContainer.maximized"}}
              @needsControls={{toBoolean state.snapshot.context.container}}
              @splitHorizontally={{horizontallySplit}}
              @send={{state.send}}
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
  </LayoutState>
</template>;

export default Layout;
