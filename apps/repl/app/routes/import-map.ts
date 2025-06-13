/* eslint-disable @typescript-eslint/ban-ts-comment */
// Some packages do not provide types

// @ts-expect-error
import * as focusTrap from 'ember-focus-trap';
import * as ePrimitives from 'ember-primitives';
import * as eResources from 'ember-resources';
import * as reactiveDebounce from 'reactiveweb/debounce';
import * as reactiveFps from 'reactiveweb/fps';
import * as reactiveFunction from 'reactiveweb/function';
import * as reactiveKeepLatest from 'reactiveweb/keep-latest';
import * as reactiveLink from 'reactiveweb/link';
import * as reactiveMap from 'reactiveweb/map';
import * as reactiveRemoteData from 'reactiveweb/remote-data';
import * as reactiveModifier from 'reactiveweb/resource/modifier';
import * as reactiveService from 'reactiveweb/resource/service';

import { ExternalLink } from 'limber-ui';

export const importMap = {};

function defineWithWarning(
  obj: object,
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
  { default: ePrimitives.Shadowed, Shadowed: ePrimitives.Shadowed },
  { name: '<Shadowed />', original: 'limber/components/shadowed', replacement: 'ember-primitives' }
);
defineWithWarning(eResources, { original: 'ember-resources/core', replacement: 'ember-resources' });
defineWithWarning(reactiveLink, {
  name: 'link',
  original: 'ember-resources/link',
  replacement: 'reactiveweb/link',
});
defineWithWarning(reactiveService, {
  name: 'service',
  original: 'ember-resources/service',
  replacement: 'reactiveweb/resource/service',
});
defineWithWarning(reactiveModifier, {
  name: 'modifier',
  original: 'ember-resources/modifier',
  replacement: 'reactiveweb/resource/modifier',
});
defineWithWarning(reactiveMap, {
  name: 'map',
  original: 'ember-resources/util/map',
  replacement: 'reactiveweb/map',
});
defineWithWarning(reactiveDebounce, {
  name: 'debounce',
  original: 'ember-resources/util/debounce',
  replacement: 'reactiveweb/debounce',
});
defineWithWarning(reactiveKeepLatest, {
  name: 'keepLatest',
  original: 'ember-resources/util/keep-latest',
  replacement: 'reactiveweb/keep-latest',
});
defineWithWarning(reactiveFunction, {
  name: 'function',
  original: 'ember-resources/util/function',
  replacement: 'reactiveweb/function',
});
defineWithWarning(reactiveFps, {
  name: 'FrameRate or UpdateFrequency',
  original: 'ember-resources/util/fps',
  replacement: 'reactiveweb/fps',
});
defineWithWarning(reactiveRemoteData, {
  name: 'RemoteData',
  original: 'ember-resources/util/remote-data',
  replacement: 'reactiveweb/remote-data',
});
defineWithWarning(focusTrap.focusTrap, {
  name: 'focusTrap',
  original: 'ember-focus-trap/modifiers/focus-trap',
  replacement: 'ember-focus-trap',
});
