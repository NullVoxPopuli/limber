/**
 * A list of all specified modules
 *   (in known-modules.ts)
 * that are expected to be provided by the host app.
 *
 * This are effectively "peer dependencies".
 * (Specifically many are virtual peers as they come from within ember-source, and are resolved via the ember vite plugin)
 *
 * This export exists for wrapping libraries to easily configure their externals array for their build tool.
 */
export const externals = [
  // Framework virtual modules
  '@ember/application',
  '@ember/application/instance',
  '@ember/array',
  '@ember/component',
  '@ember/component/helper',
  '@ember/component/template-only',
  '@ember/debug',
  '@ember/destroyable',
  '@ember/helper',
  '@ember/modifier',
  '@ember/object',
  '@ember/object/internals',
  '@ember/owner',
  '@ember/routing',
  '@ember/routing/route',
  '@ember/routing/router',
  '@ember/runloop',
  '@ember/service',
  '@ember/template',
  '@ember/template-compilation',
  '@ember/template-factory',
  '@ember/test-helpers',
  '@ember/test-waiters',
  '@ember/utils',
  '@glimmer/component',
  '@glimmer/tracking',
  '@glimmer/tracking/primitives/cache',

  // Compilation
  '@ember/template-compiler/runtime',
  '@ember/template-compiler',
  'ember-source/dist/ember-template-compiler',
  'ember-source/dist/ember-template-compiler.js',
  '@embroider/macros',

  // Libraries for later resolving
  // These may also become peers
  'ember-primitives',
  'ember-resolver',
  'ember-resources',
];
