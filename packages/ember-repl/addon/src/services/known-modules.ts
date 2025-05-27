import type { ModuleMap } from '../compile/types.ts';

const frameworkModules = {
  '@ember/application': () => import('@ember/application'),
  '@ember/application/instance': () => import('@ember/application/instance'),
  '@ember/array': () => import('@ember/array'),
  '@ember/component': () => import('@ember/component'),
  '@ember/component/helper': () => import('@ember/component/helper'),
  '@ember/component/template-only': () => import('@ember/component/template-only'),
  '@ember/debug': () => import('@ember/debug'),
  '@ember/destroyable': () => import('@ember/destroyable'),
  '@ember/helper': () => import('@ember/helper'),
  '@ember/modifier': () => import('@ember/modifier'),
  '@ember/object': () => import('@ember/object'),
  '@ember/routing': () => import('@ember/routing'),
  '@ember/routing/route': () => import('@ember/routing/route'),
  '@ember/routing/router': () => import('@ember/routing/router'),
  '@ember/runloop': () => import('@ember/runloop'),
  '@ember/service': () => import('@ember/service'),
  '@ember/test-helpers': () => import('@ember/test-helpers'),
  '@ember/test-waiters': () => import('@ember/test-waiters'),
  '@ember/template-factory': () => import('@ember/template-factory'),
  '@ember/template-compilation': () => import('@ember/template-compilation'),
  '@ember/utils': () => import('@ember/utils'),
  '@ember/template': () => import('@ember/template'),
  '@ember/owner': () => import('@ember/owner'),
  '@glimmer/component': () => import('@glimmer/component'),
  '@glimmer/tracking': () => import('@glimmer/tracking'),
  'ember-resolver': () => import('ember-resolver'),
};

const emberCompilationModules = {
  'ember-source/dist/ember-template-compiler': () =>
    import(
      // eslint-disable-next-line
      // @ts-ignore
      'ember-source/dist/ember-template-compiler.js'
    ),
  'ember-source/dist/ember-template-compiler.js': () =>
    import(
      // eslint-disable-next-line
      // @ts-ignore
      'ember-source/dist/ember-template-compiler.js'
    ),
  // Direct Dependencies
  '@babel/standalone': () => import('@babel/standalone'),
  'content-tag': () => import('content-tag'),
  'decorator-transforms': () => import('decorator-transforms'),
  'decorator-transforms/runtime': () => import('decorator-transforms/runtime'),
  'babel-plugin-ember-template-compilation': () =>
    import('babel-plugin-ember-template-compilation'),
  // Dependencies of the above
  'babel-import-util': () => import('babel-import-util'),
  // eslint-disable-next-line
  // @ts-ignore
  'babel-plugin-debug-macros': () => import('babel-plugin-debug-macros'),
  '@embroider/macros': () => ({
    // passthrough, we are not doing dead-code-elimination
    macroCondition: (x: boolean) => x,
    // I *could* actually implement this
    dependencySatisfies: () => true,
    isDevelopingApp: () => true,
    getGlobalConfig: () => ({
      WarpDrive: {
        debug: false,
        env: {
          DEBUG: false,
          TESTING: false,
          PRODUCTION: true,
        },
        activeLogging: false,
        compatWith: '99.0',
        features: {},
        deprecations: {},
        polyfillUUID: false,
        includeDataAdapter: false,
      },
    }),
    // Private
    // eslint-disable-next-line
    // @ts-ignore
    importSync: (x: string) => window[Symbol.for('__repl-sdk__compiler__')].resolves[x],
    moduleExists: () => false,
  }),
};

const markdownCompilationModules = {
  'rehype-raw': () => import('rehype-raw'),
  'rehype-stringify': () => import('rehype-stringify'),
  'remark-gfm': () => import('remark-gfm'),
  'remark-parse': () => import('remark-parse'),
  'remark-rehype': () => import('remark-rehype'),
  unified: () => import('unified'),
  'unist-util-visit': () => import('unist-util-visit'),
};

/**
 * If any real packages are defined here, they would fallback to fetching from NPM
 * instead of loading from this pre-made bundle.
 */
export const modules = (extraModules: ModuleMap): ModuleMap => ({
  ...frameworkModules,
  ...extraModules,
  ...emberCompilationModules,
  ...markdownCompilationModules,
});
