// Stands in for `node:module` inside the TypeScript worker.
//
// Glint probes the installed ember-source through createRequire.
// The worker knows the version from the file system.

export function createRequire() {
  const require = (specifier) => {
    if (specifier === 'ember-source/package.json') {
      return { name: 'ember-source', version: globalThis.tsc?.versions?.emberSource };
    }

    throw new Error(`Cannot require ${specifier} in the browser`);
  };

  require.resolve = (specifier) => `/node_modules/${specifier}`;

  return require;
}
