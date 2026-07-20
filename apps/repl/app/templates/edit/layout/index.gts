import './styles.css';

import { assert } from '@ember/debug';

import { modifier } from 'ember-modifier';
import { Resizable, ResizableHandle as Handle, ResizablePanel as Panel } from 'ember-primitives';
import { qp } from 'ember-primitives/qp';

import Save from '#components/save.gts';

import { Controls } from './controls/index.gts';
import { Orientation } from './orientation.gts';
import {
  initialEditorPercent,
  isHorizontalSplit,
  LayoutState,
  persistEditorPercent,
} from './state.ts';
import { Status } from './status.gts';

import type { TOC } from '@ember/component/template-only';
import type { ReactiveActorFrom } from 'ember-statechart-component';

type ReactiveActor = ReactiveActorFrom<typeof LayoutState>;

const setupState = modifier((element: Element, [send]: [(event: unknown) => void]) => {
  assert(`Element is not resizable`, element instanceof HTMLElement);

  send({ type: 'CONTAINER_FOUND', container: element });

  return () => send('CONTAINER_REMOVED');
});

const toBoolean = (x: unknown) => Boolean(x);
const effect = (fn: (...args: unknown[]) => void) => {
  fn();
};

/**
 * 'split' | 'minimized' | 'maximized' -- drives the CSS overrides
 * in ./styles.css (via data-editor-state).
 */
const editorScreenState = (state: ReactiveActor) => {
  if (state.matches('hasContainer.minimized')) return 'minimized';
  if (state.matches('hasContainer.maximized')) return 'maximized';

  return 'split';
};

const isResizable = (state: ReactiveActor) => {
  return editorScreenState(state) === 'split';
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

        {{! horizontallySplit stacks the panes (editor above output),
            which for <Resizable> is the "vertical" orientation (resizing along the y axis) }}
        <Resizable
          @orientation={{if horizontallySplit "vertical" "horizontal"}}
          @onLayoutChange={{fn persistEditorPercent horizontallySplit}}
          class="limber__layout"
          data-editor-state={{editorScreenState state}}
          {{setupState state.send}}
        >
          <Panel
            @size={{initialEditorPercent (qp "editor") horizontallySplit}}
            data-test-editor-panel
            class="limber__editor-panel relative grid min-h-[38px] min-w-[38px] overflow-hidden"
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

          </Panel>

          {{#if (isResizable state)}}
            <Handle
              aria-label="Resize the editor"
              class="bg-horizon-lavender leading-4 text-white shadow flex items-end justify-end focus:ring-4 focus:outline-none focus-visible:outline-none"
              {{! template-lint-disable no-inline-styles }}
              style="text-shadow: 1px 1px 1px black"
            >
              {{if horizontallySplit "⬍" "⬌"}}
            </Handle>
          {{/if}}

          <Panel class="limber__output-panel drop-shadow-inner relative grid overflow-hidden">
            <div class="bg-white relative flex overflow-auto" data-test-output>

              {{yield to="output"}}

            </div>

            <Status />
          </Panel>
        </Resizable>
      </Orientation>
    {{/let}}
  </LayoutState>
</template>;

export default Layout;
