import './registry.ts';

import Application from '@ember/application';
import compatModules from '@embroider/virtual/compat-modules';

import Resolver from 'ember-resolver';
import config from 'tutorial/config/environment';

import '@nullvoxpopuli/limber-shared/theme.css';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver.withModules(compatModules);
}
