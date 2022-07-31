import { getService } from 'ember-statechart-component';
import { assign, createMachine } from 'xstate';

interface Context {
  container?: HTMLElement;
  manualOrientation?: Direction;
  actualOrientation?: Direction;
}

export const BREAKPOINT = 1.2;

function detectAspectRatio() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  let aspectRatio = width / height;

  if (aspectRatio < BREAKPOINT) {
    return VERTICAL;
  }

  return HORIZONTAL;
}

/**
 * Touch devices can have on screen keyboards, which may
 * change the orientation of the viewport
 */
const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;
const isNonTouchDevice = () => isTouchDevice();

export function isVerticalSplit(ctx: Context) {
  return hasHorizontalOrientation(ctx);
}

export function isHorizontalSplit(ctx: Context) {
  return hasVerticalOrientation(ctx);
}

function hasHorizontalOrientation(ctx: Context) {
  return resolvedOrientation(ctx) === HORIZONTAL;
}

function hasVerticalOrientation(ctx: Context) {
  return resolvedOrientation(ctx) === VERTICAL;
}

function resolvedOrientation(ctx: Context): Direction {
  if (ctx.manualOrientation) return ctx.manualOrientation;

  return ctx.actualOrientation || VERTICAL;
}

function hasManualOrientation(ctx: Context): boolean {
  return ctx.manualOrientation !== undefined;
}

const assignOrientation = assign({
  actualOrientation: (_, { isVertical }: { isVertical: boolean }) =>
    isVertical ? VERTICAL : HORIZONTAL,
});

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
    id: 'editor-layout',
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
        cond: isNonTouchDevice,
        actions: assignOrientation,
      },
    },
    states: {
      hasContainer: {
        initial: 'default',
        entry: [assign({ actualOrientation: detectAspectRatio })],
        states: {
          default: {
            entry: ['observe'],
            exit: ['unobserve'],
            initial: 'unknownSplit',
            on: {
              MAXIMIZE: 'maximized',
              MINIMIZE: 'minimized',
            },
            states: {
              unknownSplit: {
                // the always events will only suceed if we've previously
                // resolved the device / window / iframe orientation
                // (and this is why we can't use the native Device API
                //   because we have window and iframes to worry about)
                always: [
                  { cond: isVerticalSplit, target: 'verticallySplit' },
                  { cond: isHorizontalSplit, target: 'horizontallySplit' },
                ],
                on: {
                  ORIENTATION: [
                    {
                      cond: (_, event) => event.isVertical === true && isNonTouchDevice(),
                      target: 'horizontallySplit',
                      actions: assignOrientation,
                    },
                    {
                      cond: (_, event) => event.isVertical === false && isNonTouchDevice(),
                      target: 'verticallySplit',
                      actions: assignOrientation,
                    },
                  ],
                },
              },
              horizontallySplit: {
                entry: ['restoreHorizontalSplitSize'],
                on: {
                  MINIMIZE: {
                    actions: 'persistHorizontalSplitSize',
                    target: '#editor-layout.hasContainer.minimized',
                  },
                  MAXIMIZE: {
                    actions: 'persistHorizontalSplitSize',
                    target: '#editor-layout.hasContainer.maximized',
                  },
                  ORIENTATION: [
                    {
                      cond: (_, event) => event.isVertical === false && isNonTouchDevice(),
                      target: 'verticallySplit',
                      actions: assignOrientation,
                    },
                  ],
                  ROTATE: {
                    /**
                     * When the screen is narrow, but vertically short / horiznotally wide, we split vertically,
                     * because there is more room for each part of the REPL
                     */
                    target: 'verticallySplit',
                    actions: assign({ manualOrientation: (_, __) => HORIZONTAL }),
                  },
                  RESIZE: [
                    // {
                    //   cond: hasManualOrientation,
                    //   target: 'horizontallySplit',
                    // },
                    // {
                    //   cond: isVerticalSplit,
                    //   target: 'verticallySplit',
                    //   actions: ['clearHeight'],
                    // },
                    {
                      cond: isHorizontalSplit,
                      target: 'horizontallySplit',
                      actions: ['persistHorizontalSplitSize'],
                    },
                  ],
                },
              },
              verticallySplit: {
                entry: ['restoreVerticalSplitSize'],
                on: {
                  MINIMIZE: {
                    actions: 'persistVerticalSplitSize',
                    target: '#editor-layout.hasContainer.minimized',
                  },
                  MAXIMIZE: {
                    actions: 'persistVerticalSplitSize',
                    target: '#editor-layout.hasContainer.maximized',
                  },
                  ORIENTATION: [
                    {
                      cond: (_, event) => event.isVertical === true && isNonTouchDevice(),
                      target: 'horizontallySplit',
                      actions: assignOrientation,
                    },
                  ],
                  ROTATE: {
                    /**
                     * When the screen is narrow, but vertically tall, we split horizontally,
                     * because there is more room for each part of the REPL
                     */
                    target: 'horizontallySplit',
                    actions: assign({ manualOrientation: (_, __) => VERTICAL }),
                  },
                  RESIZE: [
                    // {
                    //   cond: hasManualOrientation,
                    //   target: 'verticallySplit',
                    // },
                    // {
                    //   cond: isHorizontalSplit,
                    //   target: 'horizontallySplit',
                    //   actions: ['clearWidth'],
                    // },
                    {
                      cond: isVerticalSplit,
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
      maximizeEditor: (ctx) => maximizeEditor(ctx),
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
    container.style.maxWidth = '';
    clearHeight(container);
  } else {
    container.style.height = '38px';
    container.style.maxHeight = '';
    clearWidth(container);
  }
};
const maximizeEditor = (ctx: Context) => {
  let { container } = ctx;

  if (!container) return;

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

/**
 * We need to do all this debouncing because the other statemachine events are firing
 * after the resize observer
 *
 * and nextAnimationFrame doesn't have a way to delay.
 * Since this is specifically used with the resize observer below,
 * we can let it be quite a bit delayed to improve perf.
 */
let delay = 200;
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

/**
 * This resizeObserver is used for tracking manual resize
 * of the editor and persisting it to local storage
 */
export const setupResizeObserver = (callback: () => unknown) => {
  let observer = new ResizeObserver(() => {
    debounced(callback);
  });

  return observer;
};
