import 'limber-ui/theme.css';
import 'ember-statechart-component';
import './icons.ts';

import PageTitleService from 'ember-page-title/services/page-title';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - no types
import EmberResizeObserverService from 'ember-resize-observer-service/addon/services/resize-observer';
import Application from 'ember-strict-application-resolver';

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
  modules = {
    './router': Router,
    ...import.meta.glob('./routes/{edit,index,application,error}.ts', { eager: true }),
    ...import.meta.glob('./services/{editor,status}.ts', { eager: true }),
    ...import.meta.glob('./controllers/*.ts', { eager: true }),
    ...import.meta.glob('./templates/docs/*.gts', { eager: true }),
    ...import.meta.glob('./templates/{application,edit,output}*.gts', { eager: true }),

  // /////////////////
  // To Eliminate
  // /////////////////

  // Used by ember-container-query
  './services/resize-observer': EmberResizeObserverService,

  // /////////////////
  // To keep
  // /////////////////
  './services/page-title': PageTitleService,
}

  // LOG_RESOLVER = true;
  // LOG_ACTIVE_GENERATION = true;
  // LOG_TRANSITIONS = true;
  // LOG_TRANSITIONS_INTERNAL = true;
  // LOG_VIEW_LOOKUPS = true;
}
