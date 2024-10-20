import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type { SetupService } from 'ember-primitives';

export default class ApplicationRoute extends Route {
  @service('ember-primitives/setup') declare primitives: SetupService;

  async beforeModel() {
    this.primitives.setup();
    document.querySelector('#initial-loader')?.remove();
  }
}
