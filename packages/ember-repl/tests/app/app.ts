import Application from '@ember/application';

import Resolver from 'ember-resolver';

import config from './config.ts';
import Router from './router';
// I don't want to make this TS
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

const name = config.modulePrefix;

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver.withModules({
    [`${name}/router`]: Router,
    [`${name}/templates/application`]: EntryTemplate,
  });
}
