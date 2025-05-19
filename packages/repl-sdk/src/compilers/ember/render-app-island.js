let id = 0;

/**
 * Wait to boot the app until the Element is in the DOM.
 * because This old way of making a whole app requires that the element
 * be present in the app.
 *
 * We really need renderComponent(...)
 *   https://github.com/emberjs/ember.js/pull/20781
 */
export async function renderApp({ compiler, element, component }) {
  const [application, resolver, router] = await compiler.tryResolveAll([
    '@ember/application',
    'ember-resolver',
    '@ember/routing/router',
  ]);
  const App = application.default;
  const Resolver = resolver.default;
  const Router = router.default;

  element.id = `repl-output-${id++}`;

  let rendered = false;

  while (!rendered) {
    await new Promise((resolve) => requestAnimationFrame(resolve));

    if (!document.getElementById(element.id)) {
      continue;
    }

    console.debug('[render]', 'output will be in #', element.id);

    (class EphemeralApp extends App {
      modulePrefix = 'ephemeral-render-output';
      Resolver = Resolver.withModules({
        'ephemeral-render-output/templates/application': { default: component },
        'ephemeral-render-output/router': {
          default: class BoilerplateRouter extends Router {
            location = 'none';
            rootURL = '/';
          },
        },
      });
    }).create({
      rootElement: '#' + element.id,
    });
    rendered = true;
  }
}
