import 'limber-ui/theme.css';

import Application from '@ember/application';
import compatModules from '@embroider/virtual/compat-modules';

import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';
import config from 'tutorial/config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver.withModules(compatModules);
}

loadInitializers(App, config.modulePrefix);
