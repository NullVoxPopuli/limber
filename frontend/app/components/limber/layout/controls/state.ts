import { getService } from 'ember-statechart-component';
import { assign, createMachine } from 'xstate';

function isLargeScreen(ctx: { splitHorizontally?: boolean }) {
  return !ctx.splitHorizontally;
}

function isSmallScreen(ctx: { splitHorizontally?: boolean }) {
  return !isLargeScreen(ctx);
}

interface ContainerFoundData {
  container: HTMLElement;
  observer: ResizeObserver;
  maximize: () => void;
  minimize: () => void;
}

export default createMachine(
  {
    id: 'editor-control-state',
    initial: 'noContainer',
    schema: {
      context: {} as {
        container?: HTMLElement;
        observer?: ResizeObserver;
        maximize?: () => void;
        minimize?: () => void;
        splitHorizontally?: boolean;
      },
      events: {} as
        | ({ type: 'CONTAINER_FOUND' } & ContainerFoundData)
        | { type: 'CONTAINER_REMOVED' }
        | { type: 'MAXIMIZE' }
        | { type: 'MINIMIZE' }
        | { type: 'RESIZE' }
        | { type: 'WINDOW_RESIZE' }
        | { type: 'ORIENTATION'; splitHorizontally: boolean },
    },
    on: {
      CONTAINER_FOUND: {
        target: 'hasContainer',
        actions: assign((_, event: ContainerFoundData) => {
          let { container, observer, maximize, minimize } = event;

          return {
            container,
            observer,
            maximize,
            minimize,
          };
        }),
      },
      CONTAINER_REMOVED: {
        target: 'noContainer',
        actions: assign({ container: (_, __) => undefined }),
      },
      ORIENTATION: {
        actions: assign({
          splitHorizontally: (_, { splitHorizontally }: { splitHorizontally: boolean }) =>
            splitHorizontally,
        }),
      },
    },
    states: {
      hasContainer: {
        initial: 'default',
        states: {
          default: {
            entry: ['restoreEditor', 'observe'],
            exit: ['unobserve'],
            initial: 'unknownSplit',
            on: {
              MAXIMIZE: 'maximized',
              MINIMIZE: 'minimized',
            },
            states: {
              unknownSplit: {
                always: [
                  { cond: isLargeScreen, target: 'verticallySplit' },
                  { target: 'horizontallySplit' },
                ],
              },
              horizontallySplit: {
                entry: ['restoreHorizontalSplitSize'],
                on: {
                  RESIZE: [
                    {
                      cond: isLargeScreen,
                      target: 'verticallySplit',
                      actions: ['clearHeight'],
                    },
                    {
                      target: 'horizontallySplit',
                      actions: ['persistHorizontalSplitSize'],
                    },
                  ],
                },
              },
              verticallySplit: {
                entry: ['restoreVerticalSplitSize'],
                on: {
                  RESIZE: [
                    {
                      cond: isSmallScreen,
                      target: 'horizontallySplit',
                      actions: ['clearWidth'],
                    },
                    {
                      target: 'verticallySplit',
                      actions: ['persistVerticalSplitSize'],
                    },
                  ],
                },
              },
            },
          },
          maximized: {
            entry: ['maximizeEditor', 'addResizeListener'],
            exit: ['removeResizeListener'],
            on: {
              MAXIMIZE: 'default',
              MINIMIZE: 'minimized',
              WINDOW_RESIZE: 'maximized',
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
      maximizeEditor: ({ container }) => container && maximizeEditor(container),
      minimizeEditor: (ctx) => minimizeEditor(ctx),
      restoreEditor: (context) => {
        let { container, maximize, minimize } = context;

        if (!container) return;

        let router = getService(context, 'router');
        let editor = router.currentRoute.queryParams.editor;
        let requestingMax = editor === 'max';
        let requestingMin = editor === 'min';

        if (maximize && requestingMax) {
          maximize();
        } else if (minimize && requestingMin) {
          minimize();
        } else {
          if (isLargeScreen(context)) {
            restoreWidth(container);
            clearHeight(container);
          } else {
            restoreHeight(container);
            clearWidth(container);
          }
        }
      },

      clearHeight: ({ container }) => container && clearHeight(container),
      clearWidth: ({ container }) => container && clearWidth(container),

      restoreVerticalSplitSize: ({ container }) => container && restoreWidth(container),
      restoreHorizontalSplitSize: ({ container }) => container && restoreHeight(container),

      observe: ({ observer, container }) => {
        if (!container || !observer) return;

        observer.observe(container);
      },
      unobserve: ({ observer, container }) => {
        if (!container || !observer) return;

        observer.unobserve(container);
      },
      persistVerticalSplitSize: ({ container }) => {
        if (!container) return;

        let rect = container.getBoundingClientRect();

        setSize(WHEN_VERTICALLY_SPLIT, `${rect.width}px`);
      },
      persistHorizontalSplitSize: ({ container }) => {
        if (!container) return;

        let rect = container.getBoundingClientRect();

        setSize(WHEN_HORIZONTALLY_SPLIT, `${rect.height}px`);
      },
    },
  }
);

const minimizeEditor = (ctx: { container?: HTMLElement; splitHorizontally?: boolean }) => {
  let { container } = ctx;

  if (!container) return;

  if (isLargeScreen(ctx)) {
    container.style.width = '38px';
    clearHeight(container);
  } else {
    container.style.height = '38px';
    clearWidth(container);
  }
};
const maximizeEditor = (container: HTMLElement) => {
  container.style.width = '100%';
  container.style.height = '100%';
};

const clearHeight = (element: HTMLElement) => (element.style.height = '');
const clearWidth = (element: HTMLElement) => (element.style.width = '');
const restoreWidth = (element: HTMLElement) =>
  (element.style.width = getSize(WHEN_VERTICALLY_SPLIT) ?? '');
const restoreHeight = (element: HTMLElement) =>
  (element.style.height = getSize(WHEN_HORIZONTALLY_SPLIT) ?? '');

function getData(): SplitSizeData {
  let json = localStorage.getItem(STORAGE_NAME);

  if (!json) return {};

  try {
    return JSON.parse(json);
  } catch (e) {
    return {};
  }
}

const WHEN_VERTICALLY_SPLIT = 'WHEN_VERTICALLY_SPLIT';
const WHEN_HORIZONTALLY_SPLIT = 'WHEN_HORIZONTALLY_SPLIT';
const STORAGE_NAME = 'limber:editorSize';

type SplitName = typeof WHEN_HORIZONTALLY_SPLIT | typeof WHEN_VERTICALLY_SPLIT;
type SplitSizeData = Partial<Record<SplitName, `${number}px`>>;

function getSize(name: SplitName) {
  return getData()[name] as string;
}

function setSize(name: SplitName, value: `${number}px`) {
  let data = getData();

  data[name] = value;

  localStorage.setItem(STORAGE_NAME, JSON.stringify(data));
}

/**
 * We need to do all this debouncing because the other statemachine events are firing
 * after the resize observer
 */
let delay = 20;
let timeout: NodeJS.Timeout;
const debounced = (fn: (...args: unknown[]) => void) => {
  let forNextFrame = nextAvailableFrame.bind(null, fn);

  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(forNextFrame, delay);
};

let frame: number | null;
const nextAvailableFrame = (fn: (...args: unknown[]) => void) => {
  if (frame) cancelAnimationFrame(frame);
  frame = requestAnimationFrame(fn);
};

export const setupResizeObserver = (callback: () => unknown) => {
  let observer = new ResizeObserver(() => debounced(callback));

  return observer;
};
