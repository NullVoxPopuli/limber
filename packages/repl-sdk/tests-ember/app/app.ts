import Application from '@ember/application';
import compatModules from '@embroider/virtual/compat-modules';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import sw from 'repl-sdk/service-worker.js?url';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules(compatModules);
}

import { register } from 'register-service-worker';

console.log({ sw, register });
window.sw = sw;
register(sw, {
  ready: () => console.log('hello there'),
  registered(registration) {
    console.log('Service worker has been registered.');
  },
  cached(registration) {
    console.log('Content has been cached for offline use.');
  },
  updatefound(registration) {
    console.log('New content is downloading.');
  },
  updated(registration) {
    console.log('New content is available; please refresh.');
  },
  offline() {
    console.log(
      'No internet connection found. App is running in offline mode.'
    );
  },
  error(error) {
    console.error('Error during service worker registration:', error);
  },
});

loadInitializers(App, config.modulePrefix, compatModules);
