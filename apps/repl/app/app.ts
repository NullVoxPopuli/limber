import 'ember-statechart-component';
import './icons.ts';

import setupInspector from '@embroider/legacy-inspector-support/ember-source-4.12';
import { isDevelopingApp, macroCondition } from '@embroider/macros';

import PageTitleService from 'ember-page-title/services/page-title';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - no types
import Application from 'ember-strict-application-resolver';

import '@nullvoxpopuli/limber-shared/theme.css';

import Router from './router.ts';

// @babel/traverse (from babel-plugin-ember-template-imports)
// accesses process.....
// maybe one day we can have a browser-only verison?
// But they aren't used.... so.. that's fun.
Object.assign(window, {
  process: { env: {} },
  Buffer: {},
});

export default class App extends Application {
  inspector = setupInspector(this);
  modules = {
    './router': Router,
    ...import.meta.glob('./routes/{edit,index,application,error-404}.ts', { eager: true }),
    ...import.meta.glob('./services/{editor,status}.ts', { eager: true }),
    ...import.meta.glob('./controllers/*.ts', { eager: true }),
    ...import.meta.glob('./templates/{application,edit,output,error-404}.gts', {
      eager: true,
    }),

    // /////////////////
    // To keep
    // /////////////////
    './services/page-title': PageTitleService,
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
