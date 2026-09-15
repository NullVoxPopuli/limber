import 'ember-statechart-component';
import './icons.ts';

import Application from '@ember/application';
import setupInspector from '@embroider/legacy-inspector-support/ember-source-4.12';
import { isDevelopingApp, macroCondition } from '@embroider/macros';

import '@nullvoxpopuli/limber-shared/theme.css';

import { customLayout } from './custom-layout.ts';
import Router from './router.ts';

// @babel/traverse (from babel-plugin-ember-template-imports)
// accesses process.....
// maybe one day we can have a browser-only verison?
// But they aren't used.... so.. that's fun.
Object.assign(window, {
  process: { env: {} },
  Buffer: { isBuffer: (x: unknown) => typeof x !== 'string' },
});

export default class App extends Application {
  inspector = setupInspector(this);
  modules = {
    './router': Router,
    ...customLayout(
      import.meta.glob(
        './routes/{application,edit,index,error-404,output}/+{route,template,controller}.{ts,gts}',
        { eager: true }
      )
    ),
    ...import.meta.glob('./services/*.ts', { eager: true }),
  };
}

if (macroCondition(isDevelopingApp())) {
  Object.assign(App, {
    LOG_RESOLVER: true,
    LOG_ACTIVE_GENERATION: true,
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: true,
    LOG_VIEW_LOOKUPS: true,
  });
}
