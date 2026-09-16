import Helper from '@ember/component/helper';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';

interface Signature {
  Return: string | null;
}

export default class CurrentURL extends Helper<Signature> {
  @service declare router: RouterService;

  compute() {
    return this.router.currentURL;
  }
}
