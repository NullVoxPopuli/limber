import 'limber-snippet/theme';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { DEBUG } from '@glimmer/env';
import Application from '@ember/application';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { _backburner } from '@ember/runloop';

import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';
import { setupComponentMachines } from 'ember-statechart-component';
import { StateNode } from 'xstate';

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

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);

setupComponentMachines(StateNode);
