// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { getGlobalConfig } from '@embroider/macros/src/addon/runtime';

const ENV = {
  modulePrefix: 'limber',
  environment: import.meta.env.DEV ? 'development' : 'production',
  rootURL: '/',
  locationType: 'history',
  EmberENV: {},
  APP: {},
} as {
  environment: string;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: 'history' | 'hash' | 'none' | 'auto';
  rootURL: string;
  EmberENV: Record<string, unknown>;
  APP: Record<string, unknown>;
  SERVICE_WORKER: boolean;
};

ENV.APP.LOG_RESOLVER = true;
ENV.APP.LOG_ACTIVE_GENERATION = true;
ENV.APP.LOG_TRANSITIONS = true;
ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
ENV.APP.LOG_VIEW_LOOKUPS = true;

export default ENV;

export function enterTestMode() {
  ENV.locationType = 'none';
  ENV.APP.rootElement = '#ember-testing';
  ENV.APP.autoboot = false;

  const config = getGlobalConfig()['@embroider/macros'];

  if (config) config.isTesting = true;
}
