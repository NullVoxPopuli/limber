import Router from '@ember/routing/router';
import App from 'ember-strict-application-resolver';
import { destroy } from '@ember/destroyable';

export async function renderApp({ element, component }) {
  class EphemeralApp extends App {
    rootElement = element;
    modules = {
      './templates/application': component,
      './router': {
        default: class BoilerplateRouter extends Router {
          location = 'none';
          rootURL = '/';
        },
      },
    };
  }

  const app = EphemeralApp.create({
    rootElement: element,
  });

  return () => {
    destroy(app);
  };
}
