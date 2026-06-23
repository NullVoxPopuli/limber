import Application from '@ember/application';

import Router from './router';
// I don't want to make this TS
// @ts-expect-error
import EntryTemplate from './templates/application.gjs';

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
  modules = {
    './router': Router,
    './templates/application': EntryTemplate,
  };
}
