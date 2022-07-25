import Helper from '@ember/component/helper';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';

interface Signature {
  Args: {
    Positional: [string];
  };
  Return: string | undefined;
}

export default class QP extends Helper<Signature> {
  @service declare router: RouterService;

  compute([name]: [string]) {
    return this.router.currentRoute?.queryParams?.[name];
  }
}
