/**
 * @typedef {import('../types.ts').CompilerConfig} CompilerConfig
 */

/**
 * @param {string} id
 * @returns {string | undefined | (() => Record<string, unknown>)}
 */
function resolve(id) {
  if (id === '@ember/template-compiler/runtime') {
    return `https://esm.sh/*ember-source/dist/packages/@ember/template-compiler/runtime.js`;
  }

  if (id.startsWith('@ember')) {
    return `https://esm.sh/*ember-source/dist/packages/${id}`;
  }

  if (id.startsWith('@glimmer')) {
    return `https://esm.sh/*ember-source/dist/dependencies/${id}.js`;
  }

  if (id.startsWith('@embroider/macros')) {
    return () => ({
      // passthrough, we are not doing dead-code-elimination

      /**
       * @param {unknown} x
       */
      macroCondition: (x) => Boolean(x),
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
    });
  }
}

/**
 * @type {CompilerConfig}
 */
export const gjs = {
  resolve,
  compiler: async (...args) => {
    const gjs = await import('./ember/gjs.js');

    return gjs.compiler(...args);
  },
};

/**
 * @type {CompilerConfig}
 */
export const hbs = {
  resolve,
  compiler: async (...args) => {
    const hbs = await import('./ember/hbs.js');

    return hbs.compiler(...args);
  },
};

/**
 * @type {CompilerConfig}
 */
export const gmd = {
  resolve,
  compiler: async (...args) => {
    const hbs = await import('./ember/gmd.js');

    return hbs.compiler(...args);
  },
};
