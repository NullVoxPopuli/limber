const ENV = {
  modulePrefix: 'ember-repl-test-app',
  environment: import.meta.env.DEV ? 'development' : 'production',
  rootURL: '/',
  locationType: 'history',
  EmberENV: {
    EXTEND_PROTOTYPES: false,
    FEATURES: {
      // Here you can enable experimental features on an ember canary build
      // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
    },
  },
  APP: {
    // Here you can pass flags/options to your application instance
    // when it is created
  } as { autoboot?: boolean; rootElement?: string },
};

export default ENV;

export function enterTestMode() {
  ENV.locationType = 'none';
  ENV.APP.rootElement = '#ember-testing';
  ENV.APP.autoboot = false;
}
