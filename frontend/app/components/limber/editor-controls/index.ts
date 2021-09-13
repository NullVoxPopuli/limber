import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';

import { modifier } from 'ember-could-get-used-to-this';

import State from './state';

import type { InterpreterFrom, StateFrom } from 'xstate';

const CONTROLS_TEMPLATE = hbs`
  {{#if this.needsControls}}
    <div
      class='
        absolute top-0 right-0 z-[1] flex lg:grid
        {{if this.isMinimized
          'bg-ember-black h-full content-start'
        }}
      '
    >
      <button
        type='button'
        title={{if this.isMaximized 'Back to split view' 'Maximize Editor'}}
        class="
          block select-none py-2 px-3 text-white text-xs
          hover:bg-[#9b2918]
          focus:ring-4 ring-inset focus:outline-none"
        {{on 'click' (fn this.send 'MAXIMIZE')}}
      >
        {{#if this.isMaximized}}
          <FaIcon @icon='columns' />
        {{else}}
          <FaIcon @icon="window-maximize" @prefix='far' />
        {{/if}}
      </button>
      <button
        type='button'
        title={{if this.isMinimized 'Back to split view' 'Minimize Editor'}}
        class="
          block select-none py-2 px-3 text-white text-xs
          hover:bg-[#9b2918]
          focus:ring-4 ring-inset focus:outline-none"
        {{on 'click' (fn this.send 'MINIMIZE')}}
      >
        {{#if this.isMinimized}}
          <FaIcon @icon='columns' />
        {{else}}
          <FaIcon @icon='window-minimize' @prefix='far' />
        {{/if}}
      </button>
    </div>
  {{/if}}
`;

interface CurriedArgs {
  send: InterpreterFrom<typeof State>['send'];
  state: StateFrom<typeof State>;
}

/**
 * This is needed because we can't curry args to arbitrary renderables
 * the (component) helper only takes a string path as the first argument.
 * and... no person new to Ember should have to figure out what the naming
 * convention is for Ember component -> string path.
 *
 * This is sub-optimal because every tracked property change destroys
 * the component and creates a new (maybe identical) one. The component
 * doesn't have the ability to lazily render updates. There are no updates,
 * just creation and destruction.
 */
class CurriedControls extends Component<CurriedArgs> {
  // could this be a standalone modifier?
  // {{modifier (fn @send 'CONTAINER_FOUND') (fn @send 'CONTAINER_REMOVED')}}
  // ?
  containerToControl = modifier((element: Element) => {
    this.args.send('CONTAINER_FOUND', { container: element as HTMLElement });

    return () => this.args.send('CONTAINER_REMOVED');
  });

  get Controls() {
    let { send, state } = this.args;

    class Controls extends Component {
      send = send;
      state = state;

      get isMinimized() {
        return this.state.matches('hasContainer.minimized');
      }

      get isMaximized() {
        return this.state.matches('hasContainer.maximized');
      }

      get needsControls() {
        return Boolean(this.state.context.container);
      }
    }

    return setComponentTemplate(CONTROLS_TEMPLATE, Controls);
  }
}

setComponentTemplate(hbs`{{yield this.Controls this.containerToControl}}`, CurriedControls);

export default setComponentTemplate(
  hbs`
    <this.State as |state send|>
      <this.CurriedControls @state={{state}} @send={{send}} as |Controls container|>

        {{yield Controls container}}

      </this.CurriedControls>
    </this.State>
  `,
  class EditorControls extends Component {
    State = State;
    CurriedControls = CurriedControls;
  }
);
