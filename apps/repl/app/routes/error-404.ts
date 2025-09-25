import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';

export default class ErrorRoute extends Route {
  @service declare router: RouterService;

  model(_: unknown, transition: any) {
    return {
      intent: transition.intent.url,
      label: transition.promise._label,
    };
  }
}
