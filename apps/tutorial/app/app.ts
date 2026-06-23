import './registry.ts';

import Application from '@ember/application';
import compatModules from '@embroider/virtual/compat-modules';

import config from 'tutorial/config/environment';

import '@nullvoxpopuli/limber-shared/theme.css';

const modules: Record<string, unknown> = {};

for (const [key, mod] of Object.entries(compatModules)) {
  modules[key.replace('tutorial/', './')] = mod;
}

export default class App extends Application {
  modules = {
    ...modules,
    './config/environment': config,
  };
}
