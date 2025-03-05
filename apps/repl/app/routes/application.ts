import Route from '@ember/routing/route';

import { setupTabster } from 'ember-primitives/tabster';

const map = new WeakSet();

export default class ApplicationRoute extends Route {
  // The router is littered with bugs.. so here we only let the model hook run once per instance
  model() {
    if (!map.has(this)) {
      setupTabster(this);
      map.add(this);
    }

    document.querySelector('#initial-loader')?.remove();
  }
}
