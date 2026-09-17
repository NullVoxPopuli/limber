import { getOwner } from '@ember/owner';
import Route from '@ember/routing/route';

import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import Shadowed from 'ember-primitives/components/shadowed';
import { setupTabster } from 'ember-primitives/tabster';
import { getCompiler, setupCompiler } from 'ember-repl';

import CopyMenu from '#components/copy-menu.gts';

import { getHighlighter } from '@nullvoxpopuli/limber-shared';

import { importMap } from './import-map.ts';

import type Owner from '@ember/owner';

const map = new WeakSet();

/**
 * Shiki is a large download.
 * The first render does not need it, so it loads when a document compiles.
 */
function lazyShiki() {
  type Transform = ReturnType<typeof rehypeShikiFromHighlighter>;

  let transform: Transform | undefined;

  return async (...args: Parameters<Transform>) => {
    transform ??= rehypeShikiFromHighlighter(await getHighlighter(), { theme: 'github-dark' });

    return transform(...args);
  };
}

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
          rehypePlugins: [lazyShiki],
        },
        md: {
          rehypePlugins: [lazyShiki],
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
