import 'limber-ui/theme.css';
import 'ember-statechart-component';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { DEBUG } from '@glimmer/env';
import Application from '@ember/application';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { _backburner } from '@ember/runloop';

import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';

import config from 'limber/config/environment';

if (DEBUG) {
  // This has performance implications, but the debuggability is worth it.
  // Debugging eventloop stuff is notoriously difficult, so let's make it
  // not difficult by default.
  //
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  _backburner.DEBUG = true;
}

// @babel/traverse (from babel-plugin-ember-template-imports)
// accesses process.....
// maybe one day we can have a browser-only verison?
// But they aren't used.... so.. that's fun.
Object.assign(window, {
  process: { env: {} },
  Buffer: {},
});

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
