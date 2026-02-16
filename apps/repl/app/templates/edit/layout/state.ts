import { isDevelopingApp } from '@embroider/macros';

import { inIframe } from 'ember-primitives/iframe';
import { getService } from 'ember-statechart-component';
import { assign, setup } from 'xstate';

interface Context {
  handle?: HTMLElement;
  container?: HTMLElement;
  maximize?: () => void;
  minimize?: () => void;
  editorRequest?: {
    /**
     * should the editor start fullscreen
     */
    max: boolean;
    /**
     * should the editor start minimized
     */
    min: boolean;
    /**
     * should the editor start with a horizontal split, and what percontage of the screen space should it take?
     */
    hSplit: false | number;
    /**
     * should the editor start with a vertical split, and what percontage of the screen space should it take?
     */
    vSplit: false | number;
  };
  /**
   * Should only be true if we receive an hSplit or vSplit state
   */
  orientationChangesPrevented?: boolean;
  /**
   * e.g.: clicking the "rotate" button
   */
  manualOrientation?: Direction;
  /**
   * The actual orientation of the content window
   */
  actualOrientation?: Direction;
  /**
   * This is kept track of so we can unobserve when we no longer are rendering this state machine.
   * Also will influence the orientation.
   */
  observer?: ResizeObserver;
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

function canChangeOrientation({ context }: Data) {
  if (context.orientationChangesPrevented) return false;

  return isNonTouchDevice();
}

function isVerticalSplit(x: Data) {
  if (x.context.editorRequest?.vSplit) return true;
  if (x.context.editorRequest?.hSplit) return false;

  return hasHorizontalOrientation(x);
}

export function isHorizontalSplit(x: Data) {
  if (x.context.editorRequest?.hSplit) return true;
  if (x.context.editorRequest?.vSplit) return false;

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

function hasVerticalSplitRequest(editorQP: unknown): number | false {
  if (typeof editorQP !== 'string') return false;
  if (!editorQP.endsWith('v')) return false;

  const value = parseInt(editorQP, 10);

  if (isNaN(value)) return false;
  if (value === 0 || value === 100) return false;

  return value;
}

function hasHorizontalSplitRequset(editorQP: unknown): number | false {
  if (typeof editorQP !== 'string') return false;
  if (!editorQP.endsWith('h')) return false;

  const value = parseInt(editorQP, 10);

  if (isNaN(value)) return false;
  if (value === 0 || value === 100) return false;

  return value;
}

function isOrientationPrevented({ context }: Data) {
  const request = getEditorRequest({ context });

  return Boolean(request.vSplit || request.hSplit);
}

function getEditorRequest({ context }: Data) {
  const router = getService(context, 'router');
  const editor = router.currentRoute?.queryParams.editor;

  const requestingVerticalSplit = hasVerticalSplitRequest(editor);
  const requestingHorizontalSplit = hasHorizontalSplitRequset(editor);

  return {
    max: editor === 'max',
    min: editor === 'min',
    vSplit: requestingVerticalSplit,
    hSplit: requestingHorizontalSplit,
  };
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
    clearHeight: ({ context }) => context.container && clearHeight(context.container),
    clearWidth: ({ context }) => context.container && clearWidth(context.container),

    restoreVerticalSplitSize: ({ context }: Data) => {
      if (!context.container) return;

      const override = context.editorRequest?.vSplit
        ? `${context.editorRequest.vSplit}%`
        : undefined;

      restoreWidth(context.container, override);
    },
    restoreHorizontalSplitSize: ({ context }: Data) => {
      if (!context.container) return;

      const override = context.editorRequest?.hSplit
        ? `${context.editorRequest.hSplit}%`
        : undefined;

      restoreHeight(context.container, override);
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
  description: isDevelopingApp()
    ? 'Controls the overall layout of the app, based on orientation, ' +
      'device type, container resize, and manual rotation. Additionally, ' +
      'when the editor itself is resized, this machine controls the persisting ' +
      'and restoring of the editor size in both dimensions, depending on the current ' +
      'orientation (either default or manually overridden)'
    : '',
  schema: {
    context: {} as {
      container?: HTMLElement;
      handle?: HTMLElement;
      panes?: [HTMLElement, HTMLElement];
      observer?: ResizeObserver;
      maximize?: () => void;
      minimize?: () => void;
      orientationChangePrevented?: boolean;
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
      description: isDevelopingApp() ? `The editor has been rendered.` : '',
      target: '.hasContainer',
      actions: assign({
        /**
         * This state machine isn't a generic thing and we always know the structure of our DOM
         */
        handle: ({ event }) => event.container.nextElementSibling as HTMLElement,
        container: ({ event }) => event.container,
        observer: ({ event }) => event.observer,
        maximize: ({ event }) => event.maximize,
        minimize: ({ event }) => event.minimize,
      }),
    },
    CONTAINER_REMOVED: {
      description: isDevelopingApp() ? `The editor has been removed from the DOM.` : '',
      target: '.noContainer',
      actions: assign({ container: () => undefined }),
    },
    ORIENTATION: {
      description: isDevelopingApp() ? `Determine initial orientation for initial layout.` : '',
      guard: canChangeOrientation,
      actions: assign({
        actualOrientation: ({ event }) => (event.isVertical ? VERTICAL : HORIZONTAL),
      }),
    },
  },
  states: {
    hasContainer: {
      initial: 'default',
      description: isDevelopingApp()
        ? `When we have a div to observe, begin watching for events.`
        : '',
      entry: [
        assign({
          actualOrientation: detectAspectRatio,
          editorRequest: getEditorRequest,
          orientationChangesPrevented: isOrientationPrevented,
        }),
      ],
      states: {
        default: {
          entry: ['observe'],
          description: isDevelopingApp()
            ? `Setup resize observer for the container. ` +
              `This 'default' state is where the editor exists most of the time, ` +
              `neither minimized nor maximized.`
            : '',
          exit: ['unobserve'],
          initial: 'unknownSplit',
          on: {
            MAXIMIZE: 'maximized',
            MINIMIZE: 'minimized',
          },
          states: {
            unknownSplit: {
              description: isDevelopingApp()
                ? `If the device orientation has been determined, ` +
                  `we can immediately transition to the appropriate orientation-state, ` +
                  `else we listen for an orientation update.`
                : '',
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
                    guard: ({ event, context }) =>
                      event.isVertical === true && canChangeOrientation({ context }),
                    target: 'horizontallySplit',
                    actions: assign({
                      actualOrientation: ({ event }) => (event.isVertical ? VERTICAL : HORIZONTAL),
                    }),
                  },
                  {
                    description:
                      'Viewport orientation changed to be more horizontal. But on touch devices, we ignore this.',
                    guard: ({ event, context }) =>
                      event.isVertical === false && canChangeOrientation({ context }),
                    target: 'verticallySplit',
                    actions: assign({
                      actualOrientation: ({ event }) => (event.isVertical ? VERTICAL : HORIZONTAL),
                    }),
                  },
                ],
              },
            },
            horizontallySplit: {
              description: isDevelopingApp()
                ? `By default, the view is horizontally split when the orientation is more vertical. ` +
                  `The vertical orientation displays the editor above and the rendered output below.`
                : '',
              entry: [
                'restoreHorizontalSplitSize',
                assign({
                  editorRequest: undefined,
                }),
              ],
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
                      canChangeOrientation({ context }) &&
                      !hasManualOrientation({ context }),
                    target: 'verticallySplit',
                    actions: assign({
                      actualOrientation: ({ event }) => (event.isVertical ? VERTICAL : HORIZONTAL),
                    }),
                  },
                ],
                ROTATE: {
                  description: isDevelopingApp() ? `User manually changed the split direction` : '',
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
              description: isDevelopingApp()
                ? `By default, the view is vertically split when the orientation is more horizontal. ` +
                  `The horizontal orientation displays the editor to the left and the rendered output to the right.`
                : '',
              entry: [
                'restoreVerticalSplitSize',
                assign({
                  editorRequest: undefined,
                }),
              ],
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
                    description: isDevelopingApp()
                      ? 'Viewport orientation changed to be more vertical. But on touch devices, we ignore this.'
                      : '',
                    guard: ({ event, context }) =>
                      event.isVertical === true &&
                      canChangeOrientation({ context }) &&
                      !hasManualOrientation({ context }),
                    target: 'horizontallySplit',
                    actions: assign({
                      actualOrientation: ({ event }) => (event.isVertical ? VERTICAL : HORIZONTAL),
                    }),
                  },
                ],
                ROTATE: {
                  description: isDevelopingApp() ? `User manually changed the split direction` : '',
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
          description: isDevelopingApp()
            ? `The editor is maximized, filling the whole screen, and the output is entirely hidden.`
            : '',
          entry: ['maximizeEditor'],
          on: {
            MAXIMIZE: 'default',
            MINIMIZE: 'minimized',
            WINDOW_RESIZE: 'maximized',
          },
        },
        minimized: {
          description: isDevelopingApp()
            ? `The editor is minimized, showing only the buttons to unminimize, and maximize. The output fills nearly the entire screen.`
            : '',
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
      description: isDevelopingApp()
        ? `It's possible for the statechart to start rendering before we have a div to observe. ` +
          `When that div is rendered, it'll send an event that will transition us out of this state. ` +
          `Without that div, this statechart may not do anything.`
        : '',
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
const restoreWidth = (element: HTMLElement, overrideWidth?: string) => {
  const size = overrideWidth ?? getSize(WHEN_VERTICALLY_SPLIT) ?? '';

  element.style.width = size;
  element.style.maxHeight = '';
  element.style.height = '100%';
  element.style.maxWidth = 'calc(100vw - 72px)';
};
const restoreHeight = (element: HTMLElement, overrideHeight?: string) => {
  const offset = document.querySelector('main > header')?.getBoundingClientRect().height || 0;

  const size = overrideHeight ?? getSize(WHEN_HORIZONTALLY_SPLIT) ?? '';

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
