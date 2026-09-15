import { getOwner } from '@ember/owner';
import Route from '@ember/routing/route';
import { waitForPromise } from '@ember/test-waiters';

import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import Shadowed from 'ember-primitives/components/shadowed';
import { setupTabster } from 'ember-primitives/tabster';
import { getCompiler, setupCompiler } from 'ember-repl';

import CopyMenu from '#components/copy-menu.gts';

import { getHighlighter } from '@nullvoxpopuli/limber-shared';

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

    this.#promise = waitForPromise(this.#setup());
  }

  #promise: Promise<unknown> | undefined;

  async #setup() {
    const highlighter = await getHighlighter();
    const owner = getOwner(this);

    setupCompiler(this, {
      options: {
        gjs: {
          owner,
        },
        gmd: {
          scope: {
            CopyMenu,
            Shadowed,
          },
          rehypePlugins: [
            [
              rehypeShikiFromHighlighter,
              highlighter,
              {
                theme: 'github-dark',
              },
            ],
          ],
        },
        md: {
          rehypePlugins: [
            [
              rehypeShikiFromHighlighter,
              highlighter,
              {
                theme: 'github-dark',
              },
            ],
          ],
        },
      },
      /**
       * Anything not specified here comes from NPM via
       * ember-repl
       */
      modules: importMap,
    });
  }

  async model() {
    await this.#promise;
    document.querySelector('#initial-loader')?.remove();
  }
}
