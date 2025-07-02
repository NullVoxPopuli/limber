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

export default ENV;
