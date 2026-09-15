import { isDevelopingApp } from '@embroider/macros';

import { inIframe } from 'ember-primitives/iframe';
import { getService } from 'ember-statechart-component';
import { assign, setup } from 'xstate';

interface EditorRequest {
  /**
   * should the editor start fullscreen
   */
  max: boolean;
  /**
   * should the editor start minimized
   */
  min: boolean;
  /**
   * should the editor start with a horizontal split, and what percentage of the screen space should it take?
   */
  hSplit: false | number;
  /**
   * should the editor start with a vertical split, and what percentage of the screen space should it take?
   */
  vSplit: false | number;
}

interface Context {
  container?: HTMLElement;
  editorRequest?: EditorRequest;
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

  /**
   * Before the machine measures (CONTAINER_FOUND), fall back to the same
   * aspect-ratio heuristic it will use -- the split direction on first
   * render decides which persisted size <ResizablePanel @size> reads.
   */
  return context.actualOrientation || detectAspectRatio();
}

function hasManualOrientation({ context }: Data): boolean {
  return context.manualOrientation !== undefined;
}

function requestedMaximized({ context }: Data): boolean {
  return Boolean(context.editorRequest?.max);
}

function requestedMinimized({ context }: Data): boolean {
  return Boolean(context.editorRequest?.min);
}

/**
 * min/max requests are one-shot: once honored, returning to the
 * default split must not bounce right back.
 */
function consumeMinMaxRequest({ context }: Data): EditorRequest | undefined {
  const request = context.editorRequest;

  if (!request) return undefined;

  return { max: false, min: false, hSplit: request.hSplit, vSplit: request.vSplit };
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

function getEditorRequest({ context }: Data): EditorRequest {
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

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';

type Direction = typeof VERTICAL | typeof HORIZONTAL;

export const LayoutState = setup({
  guards: {},
  actions: {},
}).createMachine({
  id: 'editor-layout',
  initial: 'noContainer',
  description: isDevelopingApp()
    ? 'Controls the overall layout of the app, based on orientation, ' +
      'device type, and manual rotation. The sizes of the panes themselves ' +
      'are managed by <Resizable> (from ember-primitives).'
    : '',
  schema: {
    context: {} as Context,
    events: {} as
      | { type: 'CONTAINER_FOUND'; container: HTMLElement }
      | { type: 'CONTAINER_REMOVED' }
      | { type: 'MAXIMIZE' }
      | { type: 'MINIMIZE' }
      | { type: 'ROTATE' }
      | { type: 'ORIENTATION'; isVertical: boolean },
  },
  on: {
    CONTAINER_FOUND: {
      description: isDevelopingApp() ? `The editor has been rendered.` : '',
      target: '.hasContainer',
      actions: assign({
        container: ({ event }) => event.container,
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
        ? `The editor is rendered; track orientation and minimize / maximize.`
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
          description: isDevelopingApp()
            ? `This 'default' state is where the editor exists most of the time, ` +
              `neither minimized nor maximized.`
            : '',
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
                {
                  guard: requestedMaximized,
                  target: '#editor-layout.hasContainer.maximized',
                },
                {
                  guard: requestedMinimized,
                  target: '#editor-layout.hasContainer.minimized',
                },
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
                assign({
                  editorRequest: undefined,
                }),
              ],
              on: {
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
              },
            },
            verticallySplit: {
              description: isDevelopingApp()
                ? `By default, the view is vertically split when the orientation is more horizontal. ` +
                  `The horizontal orientation displays the editor to the left and the rendered output to the right.`
                : '',
              entry: [
                assign({
                  editorRequest: undefined,
                }),
              ],
              on: {
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
              },
            },
          },
        },
        maximized: {
          description: isDevelopingApp()
            ? `The editor is maximized, filling the whole screen, and the output is entirely hidden.`
            : '',
          entry: [assign({ editorRequest: consumeMinMaxRequest })],
          on: {
            MAXIMIZE: 'default',
            MINIMIZE: 'minimized',
          },
        },
        minimized: {
          description: isDevelopingApp()
            ? `The editor is minimized, showing only the buttons to unminimize, and maximize. The output fills nearly the entire screen.`
            : '',
          entry: [assign({ editorRequest: consumeMinMaxRequest })],
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

const RUNTIME_FOR_IFRAME: SplitSizeData = {};

const WHEN_VERTICALLY_SPLIT = 'WHEN_VERTICALLY_SPLIT';
const WHEN_HORIZONTALLY_SPLIT = 'WHEN_HORIZONTALLY_SPLIT';
const STORAGE_NAME = 'limber:editorSize';

type SplitName = typeof WHEN_HORIZONTALLY_SPLIT | typeof WHEN_VERTICALLY_SPLIT;

/**
 * Editor size as a percent of the pane-group.
 * (this storage previously held pixel-strings; those are ignored)
 */
type SplitSizeData = Partial<Record<SplitName, number>>;

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

function splitName(horizontallySplit: boolean): SplitName {
  return horizontallySplit ? WHEN_HORIZONTALLY_SPLIT : WHEN_VERTICALLY_SPLIT;
}

/**
 * For <Resizable @onLayoutChange> -- remembers the editor's share
 * (per split direction) so it can be restored on the next visit.
 */
export function persistEditorPercent(horizontallySplit: boolean, sizes: number[]): void {
  const percent = sizes[0];

  if (percent === undefined) return;

  if (inIframe()) {
    RUNTIME_FOR_IFRAME[splitName(horizontallySplit)] = percent;

    return;
  }

  const data = getData();

  data[splitName(horizontallySplit)] = percent;

  localStorage.setItem(STORAGE_NAME, JSON.stringify(data));
}

/**
 * The editor's initial share for <ResizablePanel @size>:
 * an explicit ?editor=NNv / ?editor=NNh request wins, then the
 * persisted size, else unset (the panels share space equally).
 */
export function initialEditorPercent(
  editorQP: unknown,
  horizontallySplit: boolean
): number | undefined {
  const requested = horizontallySplit
    ? hasHorizontalSplitRequset(editorQP)
    : hasVerticalSplitRequest(editorQP);

  if (requested !== false) return requested;

  const persisted = getData()[splitName(horizontallySplit)];

  return typeof persisted === 'number' ? persisted : undefined;
}
