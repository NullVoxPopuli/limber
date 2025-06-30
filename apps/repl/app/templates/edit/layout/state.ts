import { DEBUG } from '@glimmer/env';

import { inIframe } from 'ember-primitives/iframe';
import { getService } from 'ember-statechart-component';
import { assign, setup } from 'xstate';

interface Context {
  container?: HTMLElement;
  manualOrientation?: Direction;
  actualOrientation?: Direction;
}

interface Data {
  context: Context;
}

export const BREAKPOINT = 1.2;

function detectAspectRatio() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;

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

function isVerticalSplit(x: Data) {
  return hasHorizontalOrientation(x);
}

export function isHorizontalSplit(x: Data) {
  return hasVerticalOrientation(x);
}

function hasHorizontalOrientation(x: Data) {
  return resolvedOrientation(x) === HORIZONTAL;
}

function hasVerticalOrientation(x: Data) {
  return resolvedOrientation(x) === VERTICAL;
}

function resolvedOrientation({ context }: Data): Direction {
  if (context.manualOrientation) return context.manualOrientation;

  return context.actualOrientation || VERTICAL;
}

function hasManualOrientation({ context }: Data): boolean {
  return context.manualOrientation !== undefined;
}

interface ContainerFoundData {
  container: HTMLElement;
  observer: ResizeObserver;
  maximize: () => void;
  minimize: () => void;
}

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';

type Direction = typeof VERTICAL | typeof HORIZONTAL;

export const LayoutState = setup({
  guards: {},
  actions: {
    maximizeEditor: ({ context }) => maximizeEditor({ context }),
    minimizeEditor: ({ context }) => minimizeEditor({ context }),
    restoreEditor: ({ context }) => {
      const { container, maximize, minimize } = context;

      if (!container) return;

      const router = getService(context, 'router');
      const editor = router.currentRoute?.queryParams.editor;
      const requestingMax = editor === 'max';
      const requestingMin = editor === 'min';

      if (maximize && requestingMax) {
        maximize();
      } else if (minimize && requestingMin) {
        minimize();
      } else {
        if (isVerticalSplit({ context })) {
          restoreWidth(container);
          clearHeight(container);
        } else {
          restoreHeight(container);
          clearWidth(container);
        }
      }
    },

    clearHeight: ({ context }) => context.container && clearHeight(context.container),
    clearWidth: ({ context }) => context.container && clearWidth(context.container),

    restoreVerticalSplitSize: ({ context }) => {
      if (!context.container) return;

      restoreWidth(context.container);
    },
    restoreHorizontalSplitSize: ({ context }) => {
      if (!context.container) return;

      restoreHeight(context.container);
    },

    observe: ({ context }) => {
      const { observer, container } = context;

      if (!container || !observer) return;

      observer.observe(container);
    },
    unobserve: ({ context }) => {
      const { observer, container } = context;

      if (!container || !observer) return;

      observer.unobserve(container);
    },
    persistVerticalSplitSize: ({ context }) => {
      if (!context.container) return;

      const rect = context.container.getBoundingClientRect();

      setSize(WHEN_VERTICALLY_SPLIT, `${rect.width}px`);
    },
    persistHorizontalSplitSize: ({ context }) => {
      if (!context.container) return;

      const rect = context.container.getBoundingClientRect();

      setSize(WHEN_HORIZONTALLY_SPLIT, `${rect.height}px`);
    },
  },
}).createMachine({
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
      handle?: HTMLElement;
      panes?: [HTMLElement, HTMLElement];
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
      target: '.hasContainer',
      actions: assign({
        handle: ({ event }) => event.container.nextElementSibling,
        container: ({ event }) => event.container,
        observer: ({ event }) => event.observer,
        maximize: ({ event }) => event.maximize,
        minimize: ({ event }) => event.minimize,
      }),
    },
    CONTAINER_REMOVED: {
      description: DEBUG && `The editor has been removed from the DOM.`,
      target: '.noContainer',
      actions: assign({ container: () => undefined }),
    },
    ORIENTATION: {
      description: DEBUG && `Determine initial orientation for initial layout.`,
      guard: isNonTouchDevice,
      actions: assign({
        actualOrientation: ({ event }) => (event.isVertical ? VERTICAL : HORIZONTAL),
      }),
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
                { guard: isVerticalSplit, target: 'verticallySplit' },
                { guard: isHorizontalSplit, target: 'horizontallySplit' },
              ],
              on: {
                ORIENTATION: [
                  {
                    description:
                      'Viewport orientation changed to be more vertical. But on touch devices, we ignore this.',
                    guard: ({ event }) => event.isVertical === true && isNonTouchDevice(),
                    target: 'horizontallySplit',
                    actions: assign({
                      actualOrientation: ({ event }) => (event.isVertical ? VERTICAL : HORIZONTAL),
                    }),
                  },
                  {
                    description:
                      'Viewport orientation changed to be more horizontal. But on touch devices, we ignore this.',
                    guard: ({ event }) => event.isVertical === false && isNonTouchDevice(),
                    target: 'verticallySplit',
                    actions: assign({
                      actualOrientation: ({ event }) => (event.isVertical ? VERTICAL : HORIZONTAL),
                    }),
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
                    guard: ({ event, context }) =>
                      event.isVertical === false &&
                      isNonTouchDevice() &&
                      !hasManualOrientation({ context }),
                    target: 'verticallySplit',
                    actions: assign({
                      actualOrientation: ({ event }) => (event.isVertical ? VERTICAL : HORIZONTAL),
                    }),
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
                    guard: isHorizontalSplit,
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
                    guard: ({ event, context }) =>
                      event.isVertical === true &&
                      isNonTouchDevice() &&
                      !hasManualOrientation({ context }),
                    target: 'horizontallySplit',
                    actions: assign({
                      actualOrientation: ({ event }) => (event.isVertical ? VERTICAL : HORIZONTAL),
                    }),
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
                    guard: isVerticalSplit,
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
          entry: ['maximizeEditor'],
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
});

const minimizeEditor = ({ context }: Data) => {
  const { container } = context;

  if (!container) return;

  if (isVerticalSplit({ context })) {
    container.style.width = '38px';
    container.style.maxWidth = '';
    clearHeight(container);
  } else {
    container.style.height = '38px';
    container.style.maxHeight = '';
    clearWidth(container);
  }
};
const maximizeEditor = ({ context }: Data) => {
  const { container } = context;

  if (!container) return;

  container.style.width = '100%';
  container.style.height = '100%';
  container.style.maxHeight = '';
  container.style.maxWidth = '';
};

const clearHeight = (element: HTMLElement) => (element.style.height = '');
const clearWidth = (element: HTMLElement) => (element.style.width = '');
const restoreWidth = (element: HTMLElement) => {
  const size = getSize(WHEN_VERTICALLY_SPLIT) ?? '';

  element.style.width = size;
  element.style.maxHeight = '';
  element.style.height = '100%';
  element.style.maxWidth = 'calc(100vw - 72px)';
};
const restoreHeight = (element: HTMLElement) => {
  const offset = document.querySelector('main > header')?.getBoundingClientRect().height || 0;

  const size = getSize(WHEN_HORIZONTALLY_SPLIT) ?? '';

  element.style.height = size;
  element.style.maxWidth = '';
  element.style.width = '100%';
  element.style.maxHeight = `calc(100vh - 72px - ${offset}px)`;
};

const RUNTIME_FOR_IFRAME: Record<string, string> = {};

function getData(): SplitSizeData {
  if (inIframe()) {
    return RUNTIME_FOR_IFRAME;
  }

  const json = localStorage.getItem(STORAGE_NAME);

  if (!json) return {};

  try {
    return JSON.parse(json);
  } catch {
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
  if (inIframe()) {
    RUNTIME_FOR_IFRAME[name] = value;

    return;
  }

  const data = getData();

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
const delay = 200;
let timeout: ReturnType<typeof setTimeout>;
const debounced = (fn: (...args: unknown[]) => void) => {
  const forNextFrame = nextAvailableFrame.bind(null, fn);

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
  const observer = new ResizeObserver(() => {
    debounced(callback);
  });

  return observer;
};
