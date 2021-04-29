import { createMachine } from 'xstate';

import { setupCodeMirror } from './code-mirror';
import { setupMonaco } from './monaco';

export default createMachine({
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
        MOUSE: 'loadMonaco',
        KEY: 'loadMonaco',
        TOUCH: 'loadCodeMirror',
      },
    },
    loadMonaco: {
      invoke: {
        src: () => setupMonaco(),
        onDone: 'editingWithMonaco',
        onError: 'error',
      },
    },
    loadCodeMirror: {
      invoke: {
        src: () => setupCodeMirror(),
        onDone: 'editingWithCodeMirror',
        onError: 'error',
      },
    },
  },
});
