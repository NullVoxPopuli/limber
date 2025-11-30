import { cell } from 'ember-resources';

import { ExternalLink } from '@nullvoxpopuli/limber-shared';

export const importMap = {
  // NOTE: exposes/internal/client an export called `await`, which is not a valid identifier,
  //       and that currently breaks repl-sdk, because for pre-resolved
  // svelte: () => import('svelte'),
  // 'svelte/animate': () => import('svelte/animate'),
  // 'svelte/attachments': () => import('svelte/attachments'),
  // 'svelte/compiler': () => import('svelte/compiler'),
  // 'svelte/easing': () => import('svelte/easing'),
  // 'svelte/events': () => import('svelte/events'),
  // 'svelte/internal': () => import('svelte/internal'),
  // 'svelte/internal/disclose-version': () => import('svelte/internal/disclose-version'),
  // 'svelte/internal/client': () => import('svelte/internal/client'),
  // 'svelte/legacy': () => import('svelte/legacy'),
  // 'svelte/motion': () => import('svelte/motion'),
  // 'svelte/reactivity': () => import('svelte/reactivity'),
  // 'svelte/reactivity/window': () => import('svelte/reactivity/window'),
  // 'svelte/store': () => import('svelte/store'),
  // 'svelte/transition': () => import('svelte/transition'),

  // Ember Libraries Bundled with this REPL
  'ember-deep-tracked': () => import('ember-deep-tracked'),
  'ember-modifier': () => import('ember-modifier'),
  'ember-resources': () => import('ember-resources'),
  'tracked-built-ins': () => import('tracked-built-ins'),
  'ember-repl': () => import('ember-repl'),
  // Library does not provide types :(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  'ember-focus-trap': () => import('ember-focus-trap'),
  // Library does not provide types :(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  'tracked-toolbox': () => import('tracked-toolbox'),

  // Components from this app
  // Used in demos
  'limber-ui': () => import('limber-ui'),
  '@nullvoxpopuli/limber-shared': () => import('@nullvoxpopuli/limber-shared'),
  'limber/components/header': () => import('#edit/header.gts'),
  'limber/components/limber/header': () => import('#edit/header.gts'),
  'limber/components/limber/menu': () => import('#components/menu.gts'),
  'limber/components/menu': () => import('#components/menu.gts'),
  '@fortawesome/fontawesome-svg-core': () => import('@fortawesome/fontawesome-svg-core'),

  // non-ember libraries
  xstate: () => import('xstate'),

  // Polyfills for old behavior
  // We still want old links to work
  // aka Legacy things that don't exist anymore
  'limber/helpers/state':
    async () =>
    (...args: unknown[]) => {
      const c = cell(...args);

      return {
        ...c,

        // I don't want to type this, and the type wouldn't be used by anything
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        increment: () => c.current++,
        get value() {
          return c.current;
        },
      };
    },
};

function defineWithWarning(
  obj: object | (() => unknown),
  { name, original, replacement }: { name?: string; original: string; replacement?: string }
) {
  Object.defineProperty(importMap, original, {
    get() {
      const suggestion = replacement
        ? `Please use ${replacement} going forward.`
        : `There is not a direct replacement, please consult the docs for the library you're trying to use.`;

      if (name) {
        console.warn(
          `${name} is no longer located at ${original} and has been aliased for you. ${suggestion}`
        );
      } else {
        console.warn(
          `The import you are using at ${original} no longerg exists and has been aliased for you. ${suggestion}`
        );
      }

      if (typeof obj === 'function') {
        return obj();
      }

      return obj;
    },
  });
}

/**
 * These paths are for backcompat
 * Since code is maintained in URLs,
 * we can't upgrade any of it.
 *
 * We could probably log a deprecation message on these paths
 */
defineWithWarning(ExternalLink, {
  name: '<ExternalLink />',
  original: 'limber/components/external-link',
  replacement: '@nullvoxpopuli/limber-shared',
});
defineWithWarning(
  async () => {
    const ePrimitives = await import('ember-primitives');

    return { default: ePrimitives.Shadowed, Shadowed: ePrimitives.Shadowed };
  },
  { name: '<Shadowed />', original: 'limber/components/shadowed', replacement: 'ember-primitives' }
);
defineWithWarning(() => import('#components/menu.gts'), {
  original: 'limber/components/limber/menu',
  replacement: 'limber/components/menu',
});
defineWithWarning(() => import('#edit/header.gts'), {
  original: 'limber/components/limber/header',
  replacement: 'limber/components/header',
});
defineWithWarning(() => import('ember-resources'), {
  original: 'ember-resources/core',
  replacement: 'ember-resources',
});
defineWithWarning(() => import('reactiveweb/link'), {
  name: 'link',
  original: 'ember-resources/link',
  replacement: 'reactiveweb/link',
});
defineWithWarning(() => import('reactiveweb/resource/service'), {
  name: 'service',
  original: 'ember-resources/service',
  replacement: 'reactiveweb/resource/service',
});
defineWithWarning(() => import('reactiveweb/resource/modifier'), {
  name: 'modifier',
  original: 'ember-resources/modifier',
  replacement: 'reactiveweb/resource/modifier',
});
defineWithWarning(() => import('reactiveweb/map'), {
  name: 'map',
  original: 'ember-resources/util/map',
  replacement: 'reactiveweb/map',
});
defineWithWarning(() => import('reactiveweb/debounce'), {
  name: 'debounce',
  original: 'ember-resources/util/debounce',
  replacement: 'reactiveweb/debounce',
});
defineWithWarning(() => import('reactiveweb/keep-latest'), {
  name: 'keepLatest',
  original: 'ember-resources/util/keep-latest',
  replacement: 'reactiveweb/keep-latest',
});
defineWithWarning(() => import('reactiveweb/function'), {
  name: 'function',
  original: 'ember-resources/util/function',
  replacement: 'reactiveweb/function',
});
defineWithWarning(() => import('reactiveweb/fps'), {
  name: 'FrameRate or UpdateFrequency',
  original: 'ember-resources/util/fps',
  replacement: 'reactiveweb/fps',
});
defineWithWarning(() => import('reactiveweb/remote-data'), {
  name: 'RemoteData',
  original: 'ember-resources/util/remote-data',
  replacement: 'reactiveweb/remote-data',
});
defineWithWarning(
  async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const module = await import('ember-focus-trap');

    return {
      default: module.focusTrap,
    };
  },
  {
    name: 'focusTrap',
    original: 'ember-focus-trap/modifiers/focus-trap',
    replacement: 'ember-focus-trap',
  }
);
