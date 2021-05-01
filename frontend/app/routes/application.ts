import Ember from 'ember';
import Route from '@ember/routing/route';

const originalOnError = Ember.onerror;

export default class ApplicationRoute extends Route {
  async beforeModel() {
    document.querySelector('#initial-loader')?.remove();

    setupOnError();
  }
}

/**
 * When there is a compile error, Ember cannot render.
 * This ensures a certain level of safety in production,
 * but since we're creating a development environment inside
 * a production build, we have to get a little creative with
 * how we report errors
 */
// eslint-disable-next-line ember/no-ember-testing-in-module-scope
function setupOnError() {
  if (Ember.testing) {
    Ember.onerror = originalOnError;

    return;
  }

  Ember.onerror = (e) => {
    console.error(e);

    let origin = location.origin;
    let qps = new URLSearchParams(location.search);
    let msg = `The VM encountered an unrecoverable error

${e.message}
`;

    // prevent infinite looping
    if (qps.get('e')) {
      return;
    }

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
