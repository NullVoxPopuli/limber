import { VERSION } from '@ember/version';

import type { ModuleMap } from '../compile/types.ts';
import type { Options } from 'repl-sdk';

const frameworkModules = {
  '@ember/application': () => import('@ember/application'),
  '@ember/application/instance': () => import('@ember/application/instance'),
  '@ember/array': () => import('@ember/array'),
  '@ember/component': () => import('@ember/component'),
  '@ember/component/helper': () => import('@ember/component/helper'),
  '@ember/component/template-only': () =>
    import('@ember/component/template-only'),
  '@ember/controller': () => import('@ember/controller'),
  '@ember/debug': () => import('@ember/debug'),
  '@ember/destroyable': () => import('@ember/destroyable'),
  '@ember/helper': () => import('@ember/helper'),
  '@ember/modifier': () => import('@ember/modifier'),
  '@ember/object': () => import('@ember/object'),
  '@ember/object/compat': () => import('@ember/object/compat'),
  '@ember/object/internals': () => import('@ember/object/internals'),
  '@ember/object/observers': () => import('@ember/object/observers'),
  '@ember/owner': () => import('@ember/owner'),
  '@ember/reactive': () => import('@ember/reactive'),
  '@ember/reactive/collections': () => import('@ember/reactive/collections'),
  '@ember/renderer': () => import('@ember/renderer'),
  '@ember/routing': () => import('@ember/routing'),
  '@ember/routing/route': () => import('@ember/routing/route'),
  '@ember/routing/router': () => import('@ember/routing/router'),
  '@ember/runloop': () => import('@ember/runloop'),
  '@ember/service': () => import('@ember/service'),
  '@ember/template': () => import('@ember/template'),
  '@ember/template-compilation': () => import('@ember/template-compilation'),
  '@ember/template-factory': () => import('@ember/template-factory'),
  '@ember/test-helpers': () => import('@ember/test-helpers'),
  '@ember/test-waiters': () => import('@ember/test-waiters'),
  '@ember/test': () => import('@ember/test'),
  '@ember/utils': () => import('@ember/utils'),
  '@ember/version': () => import('@ember/version'),
  // @ts-ignore
  '@glimmer/validator': () => import('@glimmer/validator'),
  '@glimmer/component': () => import('@glimmer/component'),
  '@glimmer/tracking': () => import('@glimmer/tracking'),
  '@glimmer/tracking/primitives/cache': () =>
    import('@glimmer/tracking/primitives/cache'),
};

const coreLibraries = {
  'ember-resources': () => import('ember-resources'),
  'ember-primitives': () => import('ember-primitives'),
  // The prebuilt entry has its dependencies inlined and loads each diagram type on demand.
  // @ts-ignore
  mermaid: () => import('mermaid/dist/mermaid.esm.min.mjs'),
  'repl-sdk': () => import('repl-sdk'),
};

const emberCompilationModules = {
  '@ember/template-compiler/runtime': () =>
    import('@ember/template-compiler/runtime'),
  '@ember/template-compiler': () => import('@ember/template-compiler/runtime'),
  'ember-source/ember-template-compiler/index.js': () =>
    import(
      // @ts-ignore
      'ember-source/ember-template-compiler/index.js'
    ),
  // Direct Dependencies
  '@glimdown/babel-8-lite': () => import('@glimdown/babel-8-lite'),
  'content-tag': () => import('content-tag'),
  'decorator-transforms': () => import('decorator-transforms'),
  'decorator-transforms/runtime': () => import('decorator-transforms/runtime'),
  'decorator-transforms/runtime-esm': () =>
    import('decorator-transforms/runtime-esm'),
  'decorator-transforms/globals': () => import('decorator-transforms/globals'),
  'babel-plugin-ember-template-compilation': () =>
    import('babel-plugin-ember-template-compilation'),
  // Dependencies of the above
  'babel-import-util': () => import('babel-import-util'),

  // @ts-ignore
  'babel-plugin-debug-macros': () => import('babel-plugin-debug-macros'),
};

/**
 * If any real packages are defined here, they would fallback to fetching from NPM
 * instead of loading from this pre-made bundle.
 */
export const modules = (extraModules: ModuleMap): ModuleMap => ({
  ...coreLibraries,
  ...frameworkModules,
  ...extraModules,
  ...emberCompilationModules,
});

const EMBER_SOURCE = 'ember-source';

/**
 * Framework modules that are packages of their own.
 * Every other framework module comes from ember-source.
 */
const ownPackages = new Set([
  '@glimmer/component',
  '@ember/test-helpers',
  '@ember/test-waiters',
]);

/**
 * The npm package of a bundled module.
 *
 *   @ember/helper        → ember-source
 *   @glimmer/component   → @glimmer/component
 *   ember-primitives/x   → ember-primitives
 */
function packageOf(specifier: string): string {
  if (specifier in frameworkModules && !ownPackages.has(specifier)) {
    return EMBER_SOURCE;
  }

  if (
    specifier.startsWith('@ember/template-compiler') ||
    specifier.startsWith('ember-source/')
  ) {
    return EMBER_SOURCE;
  }

  const parts = specifier.split('/');

  return specifier.startsWith('@')
    ? `${parts[0]}/${parts[1]}`
    : (parts[0] ?? specifier);
}

/**
 * Compiler tools that work with any Ember, such as babel and content-tag.
 * Every other bundled module is tied to the bundled Ember.
 */
function isEmberIndependent(specifier: string): boolean {
  return (
    specifier in emberCompilationModules &&
    packageOf(specifier) !== EMBER_SOURCE
  );
}

/**
 * What the bundled modules are, for repl-sdk's `packages` option.
 *
 * A compile that pins a package loads it from npm in place of these modules.
 * Everything except the compiler tools imports the bundled Ember,
 * so a pin of ember-source loads those from npm too.
 */
export function packagesFor(
  specifiers: string[]
): NonNullable<Options['packages']> {
  const emberSource = { version: VERSION, modules: [] as string[] };
  const packages: NonNullable<Options['packages']> = {
    [EMBER_SOURCE]: emberSource,
  };

  for (const specifier of specifiers) {
    const name = packageOf(specifier);

    if (name === EMBER_SOURCE) {
      emberSource.modules.push(specifier);
      continue;
    }

    packages[name] ??= isEmberIndependent(specifier)
      ? {}
      : { builtWith: [EMBER_SOURCE] };
  }

  return packages;
}
