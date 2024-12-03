import 'decorator-transforms/globals';

import Application from '@ember/application';

import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';
import config from 'test-app/config/environment';

// @babel/traverse (from babel-plugin-ember-template-imports)
// accesses process.....
// maybe one day we can have a browser-only verison?
// But they aren't used.... so.. that's fun.
Object.assign(window, {
  process: { env: {} },
  // Polyfilled in webpack
  // Buffer: {},
});

import { setup } from 'ember-repl';
import compiler from 'ember-repl/compiler.js?url';
import sw from 'ember-repl/service-worker.js?url';

setup({
  serviceWorker: sw,
  compiler: compiler,
});

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
