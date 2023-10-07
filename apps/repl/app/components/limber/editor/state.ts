import { waitForPromise } from '@ember/test-waiters';

import { getService } from 'ember-statechart-component';
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
        src: (ctx) => (send) => {
          if (getService(ctx, 'router').currentRoute?.queryParams?.['forceEditor'] === 'true') {
            send('KEY');
          }

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
      // @ts-expect-error xstate doesn't do semver with typescript, and breaks regularly :(
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
