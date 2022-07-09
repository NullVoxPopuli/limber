import { assign, createMachine } from 'xstate';

function isVerticalSplit() {
  return window.innerWidth >= 1024;
}

export default createMachine(
  {
    id: 'editor-control-state',
    initial: 'noContainer',
    schema: {
      context: {} as {
        container?: HTMLElement;
      },
      events: {} as
        | { type: 'CONTAINER_FOUND'; container: HTMLElement }
        | { type: 'CONTAINER_REMOVED' }
        | { type: 'MAXIMIZE' }
        | { type: 'MINIMIZE' },
    },
    context: {
      container: undefined,
    },
    on: {
      CONTAINER_FOUND: {
        target: 'hasContainer',
        actions: assign({
          container: (_, { container }: { container: HTMLElement }) => {
            return container;
          },
        }),
      },
      CONTAINER_REMOVED: {
        target: 'noContainer',
        actions: assign({ container: (_, __) => undefined }),
      },
    },
    states: {
      hasContainer: {
        initial: 'default',
        states: {
          default: {
            entry: 'restoreEditor',
            on: {
              MAXIMIZE: 'maximized',
              MINIMIZE: 'minimized',
            },
          },
          maximized: {
            entry: 'maximizeEditor',
            on: {
              MAXIMIZE: 'default',
              MINIMIZE: 'minimized',
            },
          },
          minimized: {
            entry: 'minimizeEditor',
            on: {
              MAXIMIZE: 'maximized',
              MINIMIZE: 'default',
            },
          },
        },
      },
      noContainer: {
        /* nothing can happen, nothing to resize */
      },
    },
  },
  {
    // There is an uncaptured state where you
    // maximize the editor and then change the width across the viewport,
    // the editor snaps back to to split view *but* the icons do not appropriately
    // update due to the state machine still being in the maximized state.
    actions: {
      maximizeEditor: ({ container }) => {
        if (!container) return;

        if (isVerticalSplit()) {
          container.style.width = '100%';
          container.style.height = '';
        } else {
          container.style.width = '';
          container.style.height = '100%';
        }
      },
      minimizeEditor: ({ container }) => {
        if (!container) return;

        if (isVerticalSplit()) {
          container.style.width = '32px';
          container.style.height = '';
        } else {
          container.style.height = '32px';
          container.style.width = '';
        }
      },
      restoreEditor: ({ container }) => {
        if (!container) return;

        if (isVerticalSplit()) {
          container.style.width = '';
        } else {
          container.style.height = '';
        }
      },
    },
  }
);
