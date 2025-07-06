/**
 * @typedef {import('../types.ts').CompilerConfig} CompilerConfig
 */

/**
 * Other `@ember` (and `@glimmer`) packages are bundled in ember-source,
 * and typecilaly use a build plugin to resolve from `@ember/*` imports.
 */
const externalPackages = [
  '@ember/test-helpers',
  '@ember/string',
  '@ember/test-waiters',
  '@ember/render-modifiers',
  '@glimmer/component',
];

/**
 * @param {string} id
 * @returns {string | undefined | (() => Record<string, unknown>)}
 */
function resolve(id) {
  if (id === '@ember/template-compiler/runtime') {
    return `https://esm.sh/*ember-source/dist/packages/@ember/template-compiler/runtime.js`;
  }

  let isExternalEmber = externalPackages.some((name) => id.startsWith(name));

  if (isExternalEmber) {
    return `https://esm.sh/*${id}`;
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
    Example:
     
    Uncaught (in promise) Error: Assertion Failed: You attempted to update `count` on `Demo`, but it had already been used previously in the same computation.  Attempting to update a value after using it in a computation can cause logical errors, infinite revalidation bugs, and performance issues, and is not supported.

    `count` was first used:

    - While rendering:
      {{outlet}} for -top-level
        -top-level
          {{outlet}} for application
            Demo
              this.foos.value
                this.foos

    Stack trace for the update:
  *
  * @param {PromiseRejectionEvent} e
  * @param {(message: string) => void} handle
  */
function onUnhandled(e, handle) {
  if (!e.reason?.message) return;

  let reason = e.reason.message;

  if (reason.includes('Stack trace for the update:')) {
    reason += ' (see console)';
  }

  handle(reason);
}

/**
 * @type {CompilerConfig}
 */
export const gjs = {
  resolve,
  onUnhandled,
  codemirror: {
    lang: async () => {
      const { gjs } = await import('codemirror-lang-glimmer-js');

      return gjs();
    },
  },
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
  onUnhandled,
  codemirror: {
    lang: async () => {
      const { glimmer } = await import('codemirror-lang-glimmer');

      return glimmer();
    },
  },
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
  onUnhandled,
  codemirror: {
    lang: async () => {
      const { glimdown } = await import('codemirror-lang-glimdown');

      return glimdown();
    },
    support: async () => {
      const { gjs } = await import('codemirror-lang-glimmer-js');

      return [gjs().support];
    },
  },
  compiler: async (...args) => {
    const hbs = await import('./ember/gmd.js');

    return hbs.compiler(...args);
  },
};
