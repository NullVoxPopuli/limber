/**
 * @typedef {import('../types.ts').CompilerConfig} CompilerConfig
 */

import { babel, esmSh } from '../cdn.js';
import { deCDN, errorMessage } from '../utils.js';
import { macros } from './ember/macros.js';
import { renamedModules } from './ember/renamed-modules.js';

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
 * Ember from a CDN, for a host that does not provide it.
 *
 * @type {import('../types.ts').Plugin}
 */
const cdn = {
  name: 'repl-sdk:ember:cdn',

  resolveId(source, _importer, { versions }) {
    /**
     * A pinned ember-source comes from npm, through its renamed modules.
     * Its addons come from npm too, so that they match it.
     */
    if (versions['ember-source']) return;

    const id = deCDN(source);

    if (id === '@ember/template-compiler/runtime') {
      return `https://esm.sh/*ember-source/dist/packages/@ember/template-compiler/runtime.js`;
    }

    if (externalPackages.some((name) => id.startsWith(name))) {
      return esmSh(versions, id, true);
    }

    if (id.startsWith('@ember')) {
      return `https://esm.sh/*ember-source/dist/packages/${id}`;
    }

    if (id.startsWith('@glimmer')) {
      return `https://esm.sh/*ember-source/dist/dependencies/${id}.js`;
    }
  },
};

const plugins = [renamedModules, macros, babel, cdn];

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

  let reason = errorMessage(e.reason);

  if (reason.includes('Stack trace for the update:')) {
    reason += ' (see console)';
  }

  handle(reason);
}

/**
 * @type {CompilerConfig}
 */
export const gjs = {
  plugins,
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
export const gts = {
  plugins,
  onUnhandled,
  codemirror: {
    lang: async () => {
      const { gts } = await import('codemirror-lang-glimmer-js');

      return gts();
    },
  },
  compiler: async (config, api) => {
    const gjs = await import('./ember/gjs.js');

    return gjs.compiler(config, api, { typescript: true });
  },
};

/**
 * @type {CompilerConfig}
 */
export const hbs = {
  plugins,
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
  plugins,
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
