import Route from '@ember/routing/route';
import { cell } from 'ember-resources';

import { setupTabster } from 'ember-primitives/tabster';
import { setupREPL } from 'ember-repl';
import { importMap } from './import-map.ts';

const map = new WeakSet();

export default class ApplicationRoute extends Route {
  // The router is littered with bugs.. so here we only let the model hook run once per instance
  model() {
    if (!map.has(this)) {
      setupTabster(this);
      map.add(this);
    }

    setupREPL(this, {
      /**
       * Anything not specified here comes from NPM via
       * ember-repl
       */
      modules: {
        // Ember Libraries Bundled with this REPL
        'ember-deep-tracked': () => import('ember-deep-tracked'),
        'ember-focus-trap': () => import('ember-focus-trap'),
        'ember-modifier': () => import('ember-modifier'),
        'ember-primitives': () => import('ember-primitives'),
        'ember-resources': () => import('ember-resources'),
        'tracked-built-ins': () => import('tracked-built-ins'),
        'tracked-toolbox': () => import('tracked-toolbox'),
        'ember-repl': () => import('ember-repl'),

        // Components from this app
        'limber-ui': () => import('limber-ui'),
        'limber/components/limber/header': () => import('limber/components/limber/header'),
        'limber/components/limber/menu': () => import('limber/components/limber/menu'),

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
              // @ts-ignore
              increment: () => c.current++,
              get value() {
                return c.current;
              },
            };
          },
        ...importMap,
      },
    });

    document.querySelector('#initial-loader')?.remove();
  }
}
