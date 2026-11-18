import { preloaded } from '../../preload.js';

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
   * It must answer at once, so the module must load before the compile.
   *
   * @param {string} id
   */
  importSync: (id) => {
    const value = preloaded(id);

    if (value === undefined) {
      throw new Error(
        `importSync('${id}') needs '${id}' to load before the compile. ` +
          `Add it to the \`preload\` option of the Compiler.`
      );
    }

    return value;
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
