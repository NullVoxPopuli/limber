import { waitForPromise } from '@ember/test-waiters';

import { getQP } from 'limber/utils/query-params';
import { assign, createMachine } from 'xstate';

import { setupCodeMirror } from './-code-mirror';
import { setupMonaco } from './-monaco';

import type { ComponentFromMachine } from 'limber/statechart-component-types';

interface Context {
  error?: string;
}

export const machine = createMachine<Context>({
  initial: 'waiting',
  states: {
    waiting: {
      invoke: {
        src: () => (send) => {
          let mouse = () => send('MOUSE');
          let key = () => send('KEY');
          let touch = () => send('TOUCH');

          window.addEventListener('mousemove', mouse);
          window.addEventListener('keydown', key);
          window.addEventListener('touchstart', touch);

          return () => {
            window.removeEventListener('mousemove', mouse);
            window.removeEventListener('keydown', key);
            window.removeEventListener('touchstart', touch);
          };
        },
      },
      on: {
        /*
         * Codemirror is for mobile devices, but debugging happens
         * on desktop -- we can toggle the behavior via Query Param
         */
        MOUSE: getQP('codemirror') ? 'loadCodeMirror' : 'loadMonaco',
        KEY: 'loadMonaco',
        TOUCH: 'loadCodeMirror',
      },
    },
    loadMonaco: {
      invoke: {
        src: () => waitForPromise(setupMonaco()),
        onDone: 'editingWithMonaco',
        onError: { target: 'error', actions: assign({ error: (_, event) => event.data }) },
      },
    },
    loadCodeMirror: {
      invoke: {
        src: () => waitForPromise(setupCodeMirror()),
        onDone: 'editingWithCodeMirror',
        onError: { target: 'error', actions: assign({ error: (_, event) => event.data }) },
      },
    },
    editingWithCodeMirror: {},
    editingWithMonaco: {},
    error: {},
  },
});

export default machine as unknown as ComponentFromMachine<typeof machine>;
