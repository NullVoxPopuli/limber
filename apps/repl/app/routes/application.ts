import Route from '@ember/routing/route';

import { setupTabster } from 'ember-primitives/tabster';
import { setupCompiler } from 'ember-repl';
import { cell } from 'ember-resources';

import { importMap } from './import-map.ts';

import type Owner from '@ember/owner';

const map = new WeakSet();

export default class ApplicationRoute extends Route {
  constructor(owner: Owner) {
    super(owner);

    if (!map.has(this)) {
      setupTabster(this);
      map.add(this);
    }

    setupCompiler(this, {
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
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              increment: () => c.current++,
              get value() {
                return c.current;
              },
            };
          },
        ...importMap,
      },
    });
  }

  model() {
    document.querySelector('#initial-loader')?.remove();
  }
}
