/**
 * `@embroider/macros` at runtime.
 * A build would answer these, and remove the code that a condition rules out.
 * The REPL has no such build, so every condition runs.
 */
export const macros = {
  /**
   * @param {unknown} condition
   */
  macroCondition: (condition) => Boolean(condition),
  appEmberSatisfies: () => true,
  dependencySatisfies: () => true,
  isDevelopingApp: () => true,
  moduleExists: () => false,
  /**
   * The `import-sync` plugin turns each `importSync('x')` into an import.
   * Only a call without a string literal gets here.
   *
   * @param {string} id
   */
  importSync: (id) => {
    throw new Error(`importSync(${JSON.stringify(id)}) needs a string literal, as in a build.`);
  },
  /**
   * WarpDrive reads nested config, such as `env.DEBUG`,
   * and an empty config makes it throw.
   */
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
};
