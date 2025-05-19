/**
 * Wait to boot the app until the Element is in the DOM.
 * because This old way of making a whole app requires that the element
 * be present in the app.
 *
 * We really need renderComponent(...)
 *   https://github.com/emberjs/ember.js/pull/20781
 */
export async function renderComponent({ compiler, component, element }) {
  const [application, resolver, router, testHelpers] = await compiler.tryResolveAll([
    '@ember/application',
    'ember-resolver',
    '@ember/routing/router',
    '@ember/test-helpers',
  ]);
  const App = application.default;
  const Resolver = resolver.default;
  const Router = router.default;
  const { render, setupRenderingContext, setupContext /*, teardownContext */, setApplication } =
    testHelpers;

  class EphemeralApp extends App {
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
  }

  setApplication(
    EphemeralApp.create({
      autoboot: false,
      rootElement: '#' + element.id,
    })
  );

  const context = {};

  await setupContext(context);
  await setupRenderingContext(context);
  await render(component);
}
