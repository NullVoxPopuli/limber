import 'ember-statechart-component';

import Application from '@ember/application';

import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';
import { setupComponentMachines } from 'ember-statechart-component';
import config from 'limber/config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);

setupComponentMachines();
