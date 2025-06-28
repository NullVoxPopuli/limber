/** @type {any} */
let bootWaiter;
/** @type {any} */
let createWaiter;

/**
 * Wait to boot the app until the Element is in the DOM.
 * because This old way of making a whole app requires that the element
 * be present in the app.
 *
 * We really need renderComponent(...)
 *   https://github.com/emberjs/ember.js/pull/20781
 *
 * @param {{
 *  element: Element,
 *  modules: { [name: string]: any},
 *  selector: string,
 *  log: (type: 'error' | 'info', message: string) => void;
 *  component: unknown
 * }} options
 */
export async function renderApp({ element, modules, selector, component, log }) {
  const App = modules.application.default;
  const registerDestructor = modules.destroyable.registerDestructor;
  const Resolver = modules.resolver.default;
  const Router = modules.router.default;
  const Route = modules.route.default;
  const schedule = modules.runloop.schedule;

  bootWaiter ||= modules.testWaiters.buildWaiter('repl-output:waiting-for-boot');
  createWaiter ||= modules.testWaiters.buildWaiter('repl-output:waiting-for-creation');

  let bootToken = bootWaiter.beginAsync();
  let createToken = createWaiter.beginAsync();

  /*
  Example:
   
  Uncaught (in promise) Error: Assertion Failed: You attempted to update `count` on `Demo`, but it had already been used previously in the same computation.  Attempting to update a value after using it in a computation can cause logical errors, infinite revalidation bugs, and performance issues, and is not supported.

  `count` was first used:

  - While rendering:
    {{outlet}} for -top-level
      -top-level
        {{outlet}} for application
          Demo
            this.foos.value
              this.foos

  Stack trace for the update:
  */
  function handleUnhandledRejection(e) {
    if (!e.reason?.message) return;

    let reason = e.reason.message;

    if (reason.includes('Stack trace for the update:')) {
      reason += ' (see console)';
    }

    log('error', reason);
  }

  class EphemeralApp extends App {
    modulePrefix = 'ephemeral-render-output';
    rootElement = element;
    Resolver = Resolver.withModules({
      'ephemeral-render-output/templates/application': { default: component },
      'ephemeral-render-output/routes/application': {
        default: class Application extends Route {
          /**
           * @param {unknown[]} args
           */
          constructor(...args) {
            super(...args);

            window.addEventListener('unhandledrejection', handleUnhandledRejection);

            registerDestructor(() => {
              bootWaiter.endAsync(bootToken);
              window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            });
          }
          afterModel() {
            schedule('afterRender', () => {
              requestAnimationFrame(() => {
                log('info', 'Ember Island Rendered');
                bootWaiter.endAsync(bootToken);
                createWaiter.endAsync(createToken);
              });
            });
          }
        },
      },
      'ephemeral-render-output/router': {
        default: class BoilerplateRouter extends Router {
          location = 'none';
          rootURL = '/';
        },
      },
    });
  }

  log('info', 'Booting Ember Island');
  EphemeralApp.create({
    rootElement: element,
  });
}
