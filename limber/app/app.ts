import Ember from 'ember';
import Application from '@ember/application';

import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';
import config from 'limber/config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);

/**
 * When there is a compile error, Ember cannot render.
 * This ensures a certain level of safety in production,
 * but since we're creating a development environment inside
 * a production build, we have to get a little creative with
 * how we report errors
 */
// eslint-disable-next-line ember/no-ember-testing-in-module-scope
if (!Ember.testing) {
  Ember.onerror = (e) => {
    console.error(e);

    let origin = location.origin;
    let qps = new URLSearchParams(location.search);
    let msg = `The VM encountered an unrecoverable error

${e.message}
`;

    qps.set('e', msg);

    /**
     * This URL doesn't render the markdown content
     * as a full ember template so this is as safe page to visit
     * but viewing `/` (the full render) will cause the VM to hault
     */
    let nextUrl = `${origin}/ember?${qps}`;

    location.href = nextUrl;
  };
}
