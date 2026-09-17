import { getOwner } from '@ember/owner';
import Route from '@ember/routing/route';

import Shadowed from 'ember-primitives/components/shadowed';
import { setupTabster } from 'ember-primitives/tabster';
import { getCompiler, setupCompiler } from 'ember-repl';

import { startHighlighter } from '#app/utils/highlighting/index.ts';
import { rehypeShikiWorker } from '#app/utils/highlighting/rehype.ts';
import CopyMenu from '#components/copy-menu.gts';

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

    startHighlighter();
    this.#setup();
  }

  #setup() {
    const owner = getOwner(this);

    setupCompiler(this, {
      options: {
        gjs: {
          owner,
        },
        gts: {
          owner,
        },
        gmd: {
          scope: {
            CopyMenu,
            Shadowed,
          },
          rehypePlugins: [rehypeShikiWorker],
        },
        md: {
          rehypePlugins: [rehypeShikiWorker],
        },
      },
      /**
       * Anything not specified here comes from NPM via
       * ember-repl
       */
      modules: importMap,
    });
  }

  model() {
    document.querySelector('#initial-loader')?.remove();
  }
}
