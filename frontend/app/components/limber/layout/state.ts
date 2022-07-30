import { getService } from 'ember-statechart-component';
import { assign, createMachine } from 'xstate';

interface Context {
  container?: HTMLElement;
  manualOrientation?: Direction;
  actualOrientation?: Direction;
}

function isVerticalSplit(ctx: Context) {
  return splitDirection(ctx) === VERTICAL;
}

function isHorizontalSplit(ctx: Context) {
  return !isVerticalSplit(ctx);
}

function splitDirection(ctx: Context): Direction {
  if (ctx.manualOrientation) return ctx.manualOrientation;

  return ctx.actualOrientation || VERTICAL;
}

function hasManualOrientation(ctx: Context): boolean {
  return ctx.manualOrientation !== undefined;
}

interface ContainerFoundData {
  container: HTMLElement;
  observer: ResizeObserver;
  maximize: () => void;
  minimize: () => void;
}

const VERTICAL = 'vertical' as const;
const HORIZONTAL = 'horizontal' as const;

type Direction = typeof VERTICAL | typeof HORIZONTAL;

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
        manualOrientation?: Direction;
        actualOrientation?: Direction;
      },
      events: {} as
        | ({ type: 'CONTAINER_FOUND' } & ContainerFoundData)
        | { type: 'CONTAINER_REMOVED' }
        | { type: 'MAXIMIZE' }
        | { type: 'MINIMIZE' }
        | { type: 'RESIZE' }
        | { type: 'ROTATE' }
        | { type: 'WINDOW_RESIZE' }
        | { type: 'ORIENTATION'; isVertical: boolean },
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
          actualOrientation: (_, { isVertical }: { isVertical: boolean }) =>
            isVertical ? VERTICAL : HORIZONTAL,
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
                  { cond: isVerticalSplit, target: 'verticallySplit' },
                  { target: 'horizontallySplit' },
                ],
              },
              horizontallySplit: {
                entry: ['restoreHorizontalSplitSize'],
                on: {
                  ROTATE: {
                    target: 'verticallySplit',
                    actions: assign({ manualOrientation: (_, __) => VERTICAL }),
                  },
                  RESIZE: [
                    {
                      cond: hasManualOrientation,
                      target: 'horizontallySplit',
                    },
                    {
                      cond: isVerticalSplit,
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
                  ROTATE: {
                    target: 'horizontallySplit',
                    actions: assign({ manualOrientation: (_, __) => HORIZONTAL }),
                  },
                  RESIZE: [
                    {
                      cond: hasManualOrientation,
                      target: 'verticallySplit',
                    },
                    {
                      cond: isHorizontalSplit,
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
          if (isVerticalSplit(context)) {
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

      restoreVerticalSplitSize: ({ container }) => {
        if (!container) return;

        restoreWidth(container);
      },
      restoreHorizontalSplitSize: ({ container }) => {
        if (!container) return;

        restoreHeight(container);
      },

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

const minimizeEditor = (ctx: Context) => {
  let { container } = ctx;

  if (!container) return;

  if (isVerticalSplit(ctx)) {
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
  container.style.maxHeight = '';
  container.style.maxWidth = '';
};

const clearHeight = (element: HTMLElement) => (element.style.height = '');
const clearWidth = (element: HTMLElement) => (element.style.width = '');
const restoreWidth = (element: HTMLElement) => {
  element.style.width = getSize(WHEN_VERTICALLY_SPLIT) ?? '';
  element.style.maxHeight = '';
  element.style.height = '100%';
  element.style.maxWidth = 'calc(100vw - 38px)';
};
const restoreHeight = (element: HTMLElement) => {
  element.style.height = getSize(WHEN_HORIZONTALLY_SPLIT) ?? '';
  element.style.maxWidth = '';
  element.style.width = '100%';
  element.style.maxHeight = 'calc(100vh - 38px)';
};

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

export const setupResizeObserver = (callback: () => unknown) => {
  let observer = new ResizeObserver(() => callback);

  return observer;
};
