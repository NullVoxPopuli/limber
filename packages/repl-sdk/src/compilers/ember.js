/**
 * @typedef {import('../types.ts').CompilerConfig} CompilerConfig
 */

/**
 * @param {string} id
 * @returns {string | undefined}
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

  // if (id.includes('@embroider/macros')) {
  //   return () => {
  //     return {
  //       // passthrough, we are not doing dead-code-elimination
  //       macroCondition: (x) => x,
  //       // I *could* actually implement this
  //       dependencySatisfies: () => true,
  //       isDevelopingApp: () => true,
  //       getGlobalConfig: () => ({}),
  //       // Private
  //       importSync: (x) => cache.resolves[x],
  //       moduleExists: () => false,
  //     };
  //   };
  // }
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
