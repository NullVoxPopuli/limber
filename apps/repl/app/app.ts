import 'limber-ui/theme.css';
import 'ember-statechart-component';
import './icons.ts';

import Application from '@ember/application';

import Resolver from 'ember-resolver';

import config from '#config';

import { registry } from './registry.ts';

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
  Resolver = Resolver.withModules(registry);

  // LOG_RESOLVER = true;
  // LOG_ACTIVE_GENERATION = true;
  // LOG_TRANSITIONS = true;
  // LOG_TRANSITIONS_INTERNAL = true;
  // LOG_VIEW_LOOKUPS = true;
}
