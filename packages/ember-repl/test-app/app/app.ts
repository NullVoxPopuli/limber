import Application from '@ember/application';
import compatModules from '@embroider/virtual/compat-modules';

import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';

import config from './config/environment';

// @babel/traverse (from babel-plugin-ember-template-imports)
// accesses process.....
// maybe one day we can have a browser-only verison?
// But they aren't used.... so.. that's fun.
Object.assign(window, {
  process: { env: {} },
  // Polyfilled in webpack
  // Buffer: {},
});

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules({
    ...compatModules,
  });
}

loadInitializers(App, config.modulePrefix, compatModules);
