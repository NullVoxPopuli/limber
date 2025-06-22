/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getOwner } from '@ember/owner';
import Route from '@ember/routing/route';

import { setupTabster } from 'ember-primitives/tabster';
import { getCompiler, setupCompiler } from 'ember-repl';
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

    /**
     * This is for private debugging.
     */
    (globalThis as any)['REPL'] = {
      state: {
        get editor() {
          return owner.lookup('service:editor');
        },
        get compiler() {
          return getCompiler(owner);
        },
      },
      owner: getOwner(this),
    };

    setupCompiler(this, {
      /**
       * Anything not specified here comes from NPM via
       * ember-repl
       */
      modules: {
        // Ember Libraries Bundled with this REPL
        'ember-deep-tracked': () => import('ember-deep-tracked'),
        'ember-modifier': () => import('ember-modifier'),
        'ember-resources': () => import('ember-resources'),
        'tracked-built-ins': () => import('tracked-built-ins'),
        'ember-repl': () => import('ember-repl'),
        // @ts-expect-error
        'ember-focus-trap': () => import('ember-focus-trap'),
        // @ts-expect-error
        'tracked-toolbox': () => import('tracked-toolbox'),

        // Components from this app
        // Used in demos
        'limber-ui': () => import('limber-ui'),
        'limber/components/limber/header': () => import('#edit/header.gts'),
        'limber/components/limber/menu': () => import('#components/menu.gts'),

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
