import { ExternalLink } from 'limber-ui';

export const importMap = {};

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
  replacement: 'limber-ui',
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
