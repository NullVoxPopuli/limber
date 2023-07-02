import Helper from '@ember/component/helper';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';

export default class IsEditing extends Helper {
  @service declare router: RouterService;

  compute() {
    return this.router.currentRoute?.name !== 'output';
  }
}
