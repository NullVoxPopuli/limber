import { waitForPromise } from '@ember/test-waiters';

import { assign, createMachine } from 'xstate';

import { setupCodeMirror } from './-code-mirror';

export default createMachine({
  schema: {
    context: {} as {
      error?: string;
    },
    events: {} as { type: 'MOUSE' } | { type: 'KEY' } | { type: 'TOUCH' },
  },
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
        MOUSE: 'loadCodeMirror',
        KEY: 'loadCodeMirror',
        TOUCH: 'loadCodeMirror',
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
    error: {},
  },
});
