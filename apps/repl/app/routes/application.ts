import Route from '@ember/routing/route';
import { setupTabster } from 'ember-primitives/tabster';

export default class ApplicationRoute extends Route {
  async beforeModel() {
    await setupTabster(this);
    document.querySelector('#initial-loader')?.remove();
  }
}
