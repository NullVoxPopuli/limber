/* eslint-disable @typescript-eslint/no-explicit-any */
// import Ember from 'ember';
import { DEBUG } from '@glimmer/env';
import Route from '@ember/routing/route';

import ENV from 'limber/config/environment';

// const originalOnError = Ember.onerror;

export default class ApplicationRoute extends Route {
  async beforeModel() {
    document.querySelector('#initial-loader')?.remove();

    // setupOnError();
  }
}
