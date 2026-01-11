import { cached, tracked } from '@glimmer/tracking';
import Service, { service } from '@ember/service';

import { docsManager } from 'kolay';

import type Selected from './selected';
import type RouterService from '@ember/routing/router-service';

export default class DocsService extends Service {
  @service declare router: RouterService;
  @service declare selected: Selected;

  @tracked isViewingProse = true;

  get docs() {
    return docsManager(this);
  }

  @cached
  get tutorials() {
    return this.docs.pages ?? [];
  }

  get grouped() {
    return this.docs.tree ?? {};
  }

  get showAnswer() {
    return this.router.currentRoute?.queryParams?.['showAnswer'] === '1';
  }

  showMe = () => {
    this.#hideProse();
    this.router.transitionTo({ queryParams: { showAnswer: 1 } });
  };

  unShowMe = () => {
    this.#hideProse();
    this.router.transitionTo({ queryParams: { showAnswer: 0 } });
  };

  get currentPath(): string | undefined {
    if (!this.router.currentURL) return this.tutorials[0]?.path;

    const [path] = this.router.currentURL.split('?');

    return path && path !== '/' ? path : this.tutorials[0]?.path;
  }

  toggleProse = () => {
    if (this.isViewingProse) {
      return this.#hideProse();
    }

    this.#showProse();
  };

  #hideProse = () => {
    const words = document.querySelector('section[data-words]');

    if (words) {
      words.classList.add('-translate-x-full');
    }

    this.isViewingProse = false;
  };

  #showProse = () => {
    const words = document.querySelector('section[data-words]');

    if (words) {
      words.classList.remove('-translate-x-full');
    }

    this.isViewingProse = true;
  };
}
