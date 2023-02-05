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
          let cleanup = () => {
            window.removeEventListener('mousemove', mouse);
            window.removeEventListener('keydown', key);
            window.removeEventListener('touchstart', touch);
          };

          let mouse = () => {
            send('MOUSE');
            cleanup();
          };
          let key = () => {
            send('KEY');
            cleanup();
          };
          let touch = () => {
            send('TOUCH');
            cleanup();
          };

          window.addEventListener('mousemove', mouse, { passive: true });
          window.addEventListener('keydown', key, { passive: true });
          window.addEventListener('touchstart', touch, { passive: true });

          return cleanup;
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
