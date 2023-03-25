import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { registerDestructor } from '@ember/destroyable';

import type EmberRouter from '@ember/routing/router';
import type RouterService from '@ember/routing/router-service';

export function properLinks(klass: typeof EmberRouter) {
  return class extends klass {
    constructor(...args: object[]) {
      super(...args);

      const handler = (event: MouseEvent) => {
        /**
         * event.target may not be an anchor,
         * it may be a span, svg, img, or any number of elements nested in <a>...</a>
         */
        let interactive = isLink(event);

        if (!interactive) return;
        
        let owner = getOwner(this);

        assert('owner is not present', owner);

        let routerService = owner.lookup('service:router');

        handle(routerService, interactive, event);

        return false;
      };

      document.body.addEventListener('click', handler, false);

      registerDestructor(this, () => document.body.removeEventListener('click', handler));
    }
  };
}

function isLink(event: Event) {
  /**
   * Using composed path in case the link is removed from the DOM
   * before the event handler evaluates
   */
  let composedPath = event.composedPath();

  for (let element of composedPath) {
    if (element instanceof HTMLAnchorElement) {
      return element;
    }
  }
}

function handle(router: RouterService, element: HTMLAnchorElement, event: Event) {
  /**
   * The href includes the protocol/host/etc
   * In order to not have the page look like a full page refresh,
   * we need to chop that "origin" off, and just use the path
   */
  let url = new URL(element.href);

  let routeInfo = router.recognize(url.pathname);

  if (routeInfo) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    router.transitionTo(url.pathname);

    return false;
  }
}
