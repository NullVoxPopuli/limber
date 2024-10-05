// NOTE: this requires loadInitializers
//
//
// import loadConfigFromMeta from '@embroider/config-meta-loader';
//
// export default loadConfigFromMeta('my-vite-app');

import { isTesting, isDevelopingApp } from '@embroider/macros';

const isTest = () => isTesting() || location.href.includes('/test');

export default {
  modulePrefix: 'limber',
  environment: isTest() ? 'test' : isDevelopingApp() ? 'development' : 'production', // maybe,
  rootURL: '/',
  locationType: 'history',
  EmberENV: {
    EXTEND_PROTOTYPES: false,
    FEATURES: {
      // Here you can enable experimental features on an ember canary build
      // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
    },
  },

  ...(isTest()
    ? {
        locationType: 'none',
      }
    : {}),

  APP: {
    ...(isTest()
      ? {
          LOG_ACTIVE_GENERATION: false,
          LOG_VIEW_LOOKUPS: false,
          rootElement: '#ember-testing',
          autoboot: false,
        }
      : {}),
  },
};
