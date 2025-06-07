let id = 0;

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
 *  compiler: import('../../types.ts').PublicMethods,
 *  element: HTMLElement,
 *  component: unknown
 * }} options
 */
export async function renderApp({ compiler, element, component }) {
  const [application, destroyable, resolver, router, route, testWaiters, runloop] =
    await compiler.tryResolveAll([
      '@ember/application',
      '@ember/destroyable',
      'ember-resolver',
      '@ember/routing/router',
      '@ember/routing/route',
      '@ember/test-waiters',
      '@ember/runloop',
    ]);
  const App = application.default;
  const registerDestructor = destroyable.registerDestructor;
  const Resolver = resolver.default;
  const Router = router.default;
  const Route = route.default;
  const schedule = runloop.schedule;

  element.id = `repl-output-${id++}`;
  bootWaiter ||= testWaiters.buildWaiter('repl-output:waiting-for-boot');
  createWaiter ||= testWaiters.buildWaiter('repl-output:waiting-for-creation');

  console.log('booting');

  let bootToken = bootWaiter.beginAsync();
  let createToken = createWaiter.beginAsync();

  class EphemeralApp extends App {
    modulePrefix = 'ephemeral-render-output';
    Resolver = Resolver.withModules({
      'ephemeral-render-output/templates/application': { default: component },
      'ephemeral-render-output/routes/application': {
        default: class Application extends Route {
          constructor(...args) {
            super(...args);

            registerDestructor(() => {
              bootWaiter.endAsync(bootToken);
            });
          }
          afterModel() {
            schedule('afterRender', () => {
              requestAnimationFrame(() => {
                console.log('booted');
                bootWaiter.endAsync(bootToken);
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

  while (true) {
    await new Promise((resolve) => requestAnimationFrame(resolve));

    if (!document.getElementById(element.id)) {
      console.log('waiting for target element to appear');
      continue;
    }

    console.log('created element. app can start');
    EphemeralApp.create({
      rootElement: '#' + element.id,
    });

    createWaiter.endAsync(createToken);

    break;
  }
}
