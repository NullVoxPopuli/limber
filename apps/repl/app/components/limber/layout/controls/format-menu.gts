import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import { Button } from './button';

import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

export class FormatMenu extends Component<{ Element: HTMLButtonElement }> {
  @service declare router: RouterService;

  switch = (format: Format): void => {
    this.router.transitionTo({ queryParams: { format } });
  };

  <template>
    <Button {{on "click" (fn this.switch "glimdown")}}>
      Glimdown
    </Button>

    <Button {{on "click" (fn this.switch "gjs")}}>
      Glimmer JS
    </Button>

    <Button {{on "click" (fn this.switch "hbs")}}>
      Template
    </Button>
  </template>
}
