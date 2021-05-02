import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';

interface Args {
  href: string;
}

export default class TabLink extends Component<Args> {
  @service declare router: RouterService;

  get isActive() {
    let routeInfo = this.router.recognize(this.args.href);

    // TODO: RFC isActive to take a whole routeInfo
    //       It's too much work to recurse up the route tree building
    //       the arguments for this otherwise.
    return this.router.isActive(routeInfo.name);
  }

  @action
  handleClick(e: MouseEvent) {
    e.preventDefault();

    // It's "fine"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let qps = new URLSearchParams(this.router.currentRoute.queryParams as any);

    this.router.transitionTo(this.args.href + `?${qps}`);
  }
}
