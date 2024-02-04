/* eslint-disable @typescript-eslint/ban-ts-comment */
// Some packages do not provide types

import * as eDeepTracked from 'ember-deep-tracked';
// @ts-expect-error
import * as focusTrap from 'ember-focus-trap';
// @ts-expect-error
import * as mFocusTrap from 'ember-focus-trap/modifiers/focus-trap';
import * as headlessMenu from 'ember-headlessui/components/menu';
import * as eModifier from 'ember-modifier';
import * as ePrimitives from 'ember-primitives';
import * as emberRepl from 'ember-repl';
import * as eResources from 'ember-resources';
import * as reactiveDebounce from 'reactiveweb/debounce';
import * as reactiveFps from 'reactiveweb/fps';
import * as reactiveFunction from 'reactiveweb/function';
import * as reactiveImage from 'reactiveweb/image';
import * as reactiveKeepLatest from 'reactiveweb/keep-latest';
import * as reactiveLink from 'reactiveweb/link';
import * as reactiveMap from 'reactiveweb/map';
import * as reactiveRemoteData from 'reactiveweb/remote-data';
import * as reactiveModifier from 'reactiveweb/resource/modifier';
import * as reactiveService from 'reactiveweb/resource/service';
import * as reactiveSync from 'reactiveweb/sync';
import * as reactiveThrottle from 'reactiveweb/throttle';
import * as reactiveWaitUntil from 'reactiveweb/wait-until';
import * as trackedBuiltIns from 'tracked-built-ins';
// @ts-expect-error
import * as trackedToolbox from 'tracked-toolbox';
import * as xstate from 'xstate';

import * as limberExternalLink from 'limber/components/external-link';
import * as limberHeader from 'limber/components/limber/header';
import * as limberMenu from 'limber/components/limber/menu';
import * as limberShadowed from 'limber/components/shadowed';

export const importMap = {
  // Own Stuff
  'limber/components/limber/menu': limberMenu,
  'limber/components/limber/header': limberHeader,
  'limber/components/external-link': limberExternalLink,
  'limber/components/shadowed': limberShadowed,

  // Libraries
  'ember-repl': emberRepl,
  xstate: xstate,
  'ember-modifier': eModifier,
  'tracked-built-ins': trackedBuiltIns,
  'ember-headlessui/components/menu': headlessMenu,
  'ember-focus-trap': focusTrap,
  'ember-focus-trap/modifiers/focus-trap': mFocusTrap,
  'ember-primitives': ePrimitives,
  'tracked-toolbox': trackedToolbox,
  'ember-deep-tracked': eDeepTracked,
  'ember-resources': eResources,

  // Reactiveweb *only* has path imports
  'reactiveweb/debounce': reactiveDebounce,
  'reactiveweb/ember-concurrency': reactiveDebounce,
  'reactiveweb/fps': reactiveFps,
  'reactiveweb/function': reactiveFunction,
  'reactiveweb/image': reactiveImage,
  'reactiveweb/keep-latest': reactiveKeepLatest,
  'reactiveweb/link': reactiveLink,
  'reactiveweb/map': reactiveMap,
  'reactiveweb/remote-data': reactiveRemoteData,
  'reactiveweb/modifier': reactiveModifier,
  'reactiveweb/service': reactiveService,
  'reactiveweb/sync': reactiveSync,
  'reactiveweb/throttle': reactiveThrottle,
  'reactiveweb/wait-until': reactiveWaitUntil,

  // These paths are for backcompat
  // Since code is maintained in URLs,
  // we can't upgrade any of it.
  //
  // We could probably log a deprecation message on these paths
  'ember-resources/core': eResources,
  'ember-resources/link': reactiveLink,
  'ember-resources/service': reactiveService,
  'ember-resources/modifier': reactiveModifier,
  'ember-resources/util/map': reactiveMap,
  'ember-resources/util/debounce': reactiveDebounce,
  'ember-resources/util/keep-latest': reactiveKeepLatest,
  'ember-resources/util/function': reactiveFunction,
  'ember-resources/util/fps': reactiveFps,
  'ember-resources/util/remote-data': reactiveRemoteData,
};
