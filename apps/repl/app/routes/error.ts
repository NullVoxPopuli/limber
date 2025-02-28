import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';

export default class ApplicationRoute extends Route {
  @service declare router: RouterService;

  async beforeModel() {
    this.router.transitionTo('/');
  }
}
