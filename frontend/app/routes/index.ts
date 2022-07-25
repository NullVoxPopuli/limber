import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';

/**
 * The '/' route is not available, in that we must either visit one of
 * - /edit
 * - /output
 * - /ember
 */
export default class IndexRoute extends Route {
  @service declare router: RouterService;

  async beforeModel() {
    this.router.transitionTo('edit');
  }
}
