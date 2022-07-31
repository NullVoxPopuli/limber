import { DEBUG } from '@glimmer/env';

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
const isNonTouchDevice = () => !isTouchDevice();

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
    description:
      DEBUG &&
      'Controls the overall layout of the app, based on orientation, ' +
        'device type, container resize, and manual rotation. Additionally, ' +
        'when the editor itself is resized, this machine controls the persisting ' +
        'and restoring of the editor size in both dimensions, depending on the current ' +
        'orientation (either default or manually overridden)',
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
        description: DEBUG && `The editor has been rendered.`,
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
        description: DEBUG && `The editor has been removed from the DOM.`,
        target: 'noContainer',
        actions: assign({ container: (_, __) => undefined }),
      },
      ORIENTATION: {
        description: DEBUG && `Determine initial orientation for initial layout.`,
        cond: isNonTouchDevice,
        actions: assignOrientation,
      },
    },
    states: {
      hasContainer: {
        initial: 'default',
        description: DEBUG && `When we have a div to observe, begin watching for events.`,
        entry: [assign({ actualOrientation: detectAspectRatio })],
        states: {
          default: {
            entry: ['observe'],
            description:
              DEBUG &&
              `Setup resize observer for the container. ` +
                `This 'default' state is where the editor exists most of the time, ` +
                `neither minimized nor maximized.`,
            exit: ['unobserve'],
            initial: 'unknownSplit',
            on: {
              MAXIMIZE: 'maximized',
              MINIMIZE: 'minimized',
            },
            states: {
              unknownSplit: {
                description:
                  DEBUG &&
                  `If the device orientation has been determined, ` +
                    `we can immediately transition to the appropriate orientation-state, ` +
                    `else we listen for an orientation update.`,
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
                      description:
                        'Viewport orientation changed to be more vertical. But on touch devices, we ignore this.',
                      cond: (_, event) => event.isVertical === true && isNonTouchDevice(),
                      target: 'horizontallySplit',
                      actions: assignOrientation,
                    },
                    {
                      description:
                        'Viewport orientation changed to be more horizontal. But on touch devices, we ignore this.',
                      cond: (_, event) => event.isVertical === false && isNonTouchDevice(),
                      target: 'verticallySplit',
                      actions: assignOrientation,
                    },
                  ],
                },
              },
              horizontallySplit: {
                description:
                  DEBUG &&
                  `By default, the view is horizontally split when the orientation is more vertical. ` +
                    `The vertical orientation displays the editor above and the rendered output below.`,
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
                      description:
                        'Viewport orientation changed to be more horizontal. But on touch devices, we ignore this.',
                      cond: (ctx, event) =>
                        event.isVertical === false &&
                        isNonTouchDevice() &&
                        !hasManualOrientation(ctx),
                      target: 'verticallySplit',
                      actions: assignOrientation,
                    },
                  ],
                  ROTATE: {
                    description: DEBUG && `User manually changed the split direction`,
                    target: 'verticallySplit',
                    actions: assign({ manualOrientation: (_, __) => HORIZONTAL }),
                  },
                  RESIZE: [
                    {
                      description: 'if we retain the same orientation, persist the editor height',
                      cond: isHorizontalSplit,
                      target: 'horizontallySplit',
                      actions: ['persistHorizontalSplitSize'],
                    },
                  ],
                },
              },
              verticallySplit: {
                description:
                  DEBUG &&
                  `By default, the view is vertically split when the orientation is more horizontal. ` +
                    `The horizontal orientation displays the editor to the left and the rendered output to the right.`,
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
                      description:
                        DEBUG &&
                        'Viewport orientation changed to be more vertical. But on touch devices, we ignore this.',
                      cond: (ctx, event) =>
                        event.isVertical === true &&
                        isNonTouchDevice() &&
                        !hasManualOrientation(ctx),
                      target: 'horizontallySplit',
                      actions: assignOrientation,
                    },
                  ],
                  ROTATE: {
                    description: DEBUG && `User manually changed the split direction`,
                    target: 'horizontallySplit',
                    actions: assign({ manualOrientation: (_, __) => VERTICAL }),
                  },
                  RESIZE: [
                    {
                      description: 'if we retain the same orientation, persist the editor width',
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
            description:
              DEBUG &&
              `The editor is maximized, filling the whole screen, and the output is entirely hidden.`,
            entry: ['maximizeEditor', 'addResizeListener'],
            exit: ['removeResizeListener'],
            on: {
              MAXIMIZE: 'default',
              MINIMIZE: 'minimized',
              WINDOW_RESIZE: 'maximized',
            },
          },
          minimized: {
            description:
              DEBUG &&
              `The editor is minimized, showing only the buttons to unminimize, and maximize. The output fills nearly the entire screen.`,
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
        description:
          DEBUG &&
          `It's possible for the statechart to start rendering before we have a div to observe. ` +
            `When that div is rendered, it'll send an event that will transition us out of this state. ` +
            `Without that div, this statechart may not do anything.`,
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
  element.style.maxWidth = 'calc(100vw - 72px)';
};
const restoreHeight = (element: HTMLElement) => {
  let offset = document.querySelector('main > header')?.getBoundingClientRect().height || 0;

  element.style.height = getSize(WHEN_HORIZONTALLY_SPLIT) ?? '';
  element.style.maxWidth = '';
  element.style.width = '100%';
  element.style.maxHeight = `calc(100vh - 72px - ${offset}px)`;
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
