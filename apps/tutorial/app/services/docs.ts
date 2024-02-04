import { cached, tracked } from '@glimmer/tracking';
import Service, { service } from '@ember/service';

import { use } from 'ember-resources';
import { RemoteData } from 'reactiveweb/remote-data';

import type Selected from './selected';
import type { Manifest } from './types';
import type RouterService from '@ember/routing/router-service';

export default class DocsService extends Service {
  @service declare router: RouterService;
  @service declare selected: Selected;

  @tracked isViewingProse = true;

  @use docs = RemoteData<Manifest>(() => `/docs/manifest.json`);

  get tutorials() {
    return this.docs.value?.list ?? [];
  }

  get grouped() {
    return this.docs.value?.grouped ?? {};
  }

  get showAnswer() {
    return this.router.currentRoute?.queryParams?.['showAnswer'] === '1' ?? false;
  }

  showMe = () => {
    this.#hideProse();
    this.router.transitionTo({ queryParams: { showAnswer: 1 } });
  };

  unShowMe = () => {
    this.#hideProse();
    this.router.transitionTo({ queryParams: { showAnswer: 0 } });
  };

  @cached
  get flatList() {
    return this.tutorials.flat();
  }

  get currentPath(): string | undefined {
    if (!this.router.currentURL) return this.#manifest?.first.path;

    let [path] = this.router.currentURL.split('?');

    return path && path !== '/' ? path : this.#manifest?.first.path;
  }

  get #manifest() {
    return this.docs.value;
  }

  toggleProse = () => {
    if (this.isViewingProse) {
      return this.#hideProse();
    }

    this.#showProse();
  };

  #hideProse = () => {
    let words = document.querySelector('section[data-words]');

    if (words) {
      words.classList.add('-translate-x-full');
    }

    this.isViewingProse = false;
  };

  #showProse = () => {
    let words = document.querySelector('section[data-words]');

    if (words) {
      words.classList.remove('-translate-x-full');
    }

    this.isViewingProse = true;
  };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    docs: DocsService;
  }
}
