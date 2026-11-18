/**
 * @typedef {import('../../types.ts').Plugin} Plugin
 * @typedef {import('../../types.ts').PluginContext} PluginContext
 */

import { cache, secretKey } from '../../cache.js';
import { satisfiesRange } from '../../fs/semver.js';
import { installer } from '../../fs/store.js';
import { parseNpmUrl, parseVirtualUrl, virtualUrl } from '../../fs/url.js';
import { virtualModuleSource } from '../../fs/virtual.js';
import { parseSpecifier } from '../../specifier.js';
import { deCDN } from '../../utils.js';

const MACROS = '@embroider/macros';
const MACROS_IMPORT = /import\s*\{([^}]*)\}\s*from\s*['"]@embroider\/macros['"]/g;

let testing = false;

/**
 * The macros that run in the browser.
 * The plugin answers the others when it loads a module.
 */
const runtime = {
  /**
   * A build would also remove the branches that a condition rules out.
   * The REPL keeps every branch.
   *
   * @param {unknown} predicate
   */
  macroCondition: (predicate) => predicate,
  /**
   * @param {unknown} array
   */
  each: (array) => {
    if (!Array.isArray(array)) throw new Error(`the argument to each() must be an array`);

    return array;
  },
  isDevelopingApp: () => true,
  isTesting: () => testing,
  /**
   * @param {boolean} value
   */
  setTesting: (value) => {
    testing = Boolean(value);
  },
  /**
   * An app sets these in its build, and the REPL has no build.
   */
  getConfig: () => undefined,
  getOwnConfig: () => undefined,
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
  /**
   * @param {string} message
   */
  failBuild: (message) => {
    throw new Error(message);
  },
  importSync: needsLiterals('importSync'),
  dependencySatisfies: needsLiterals('dependencySatisfies'),
  appEmberSatisfies: needsLiterals('appEmberSatisfies'),
  moduleExists: needsLiterals('moduleExists'),
};

/**
 * The plugin answers each call with string literals when it loads the module.
 * Only other calls get here, and a build rejects them too.
 *
 * @param {string} name
 */
function needsLiterals(name) {
  /**
   * @param {unknown[]} args
   */
  return (...args) => {
    throw new Error(
      `${name}(${args.map((arg) => JSON.stringify(arg)).join(', ')}) needs string literals`
    );
  };
}

/**
 * `@embroider/macros`, for the modules that load from npm and from CDNs.
 *
 * @type {Plugin}
 */
export const macros = {
  name: 'repl-sdk:ember:macros',

  resolveId(id) {
    if (!deCDN(id).startsWith(MACROS)) return;

    return virtualUrl('configured', MACROS);
  },

  load(id) {
    const virtual = parseVirtualUrl(id);

    if (virtual?.kind !== 'configured' || virtual.name !== MACROS) return;

    cache.resolves[MACROS] = runtime;

    return virtualModuleSource(MACROS, runtime, secretKey);
  },

  transform(code, url, ctx) {
    return answerMacros(code, (name) => versionOf(name, url, ctx));
  },
};

/**
 * The version of a package that a module gets, from the package.json files in the file system,
 * as a build reads them from `node_modules`:
 * the dependency of the module's own package, else the pin.
 * The modules in `resolve` have no package.json, so their version comes from `packages`.
 *
 * @param {string} name
 * @param {string} url the module
 * @param {PluginContext} ctx
 * @returns {Promise<string | undefined>}
 */
async function versionOf(name, url, ctx) {
  const owner = parseNpmUrl(url);
  const manifest = owner ? (await installer.package(owner.name, owner.version)).manifest : {};
  const dependencies = /** @type {{ dependencies?: Record<string, string> }} */ (manifest)
    .dependencies;
  const range = dependencies?.[name] ?? ctx.versions[name];

  if (range) return (await installer.package(name, range)).manifest.version;

  return ctx.packages[name]?.version;
}

/**
 * Replaces the macros about versions with `true` or `false`.
 *
 * Replaces each `importSync('x')` with an import of `x`, so that the loader follows it
 * like any import. A module that does not load throws only when code reads from it,
 * because the REPL keeps the branches that a build would remove.
 *
 * @param {string} code
 * @param {(name: string) => Promise<string | undefined>} versionOf the version of a package that the module gets
 * @returns {Promise<string | undefined>}
 */
export async function answerMacros(code, versionOf) {
  if (!code.includes(MACROS)) return;

  const names = localNames(code);

  if (names.size === 0) return;

  /**
   * @param {string} name
   * @param {string} range
   */
  async function satisfies(name, range) {
    const version = await versionOf(name);

    return version !== undefined && satisfiesRange(version, range);
  }

  /**
   * @type {Record<string, (first: string, second?: string) => Promise<boolean>>}
   */
  const answers = {
    dependencySatisfies: (name, range = '*') => satisfies(name, range),
    appEmberSatisfies: (range) => satisfies('ember-source', range),
    moduleExists: async (id) => (await versionOf(parseSpecifier(id).name)) !== undefined,
  };

  let result = code;

  for (const [imported, answer] of Object.entries(answers)) {
    const local = names.get(imported);

    if (!local) continue;

    const calls = Array.from(result.matchAll(callsOf(local)));
    const values = await Promise.all(
      calls.map(([, , first, , second]) => answer(first ?? '', second))
    );
    let index = 0;

    result = result.replace(callsOf(local), () => String(values[index++]));
  }

  const local = names.get('importSync');

  return local ? importsInsteadOf(local, result) : result;
}

/**
 * @param {string} local
 * @param {string} code
 */
function importsInsteadOf(local, code) {
  /**
   * @type {Map<string, string>}
   */
  const bindings = new Map();

  const result = code.replace(callsOf(local), (_call, _quote, specifier) => {
    let binding = bindings.get(specifier);

    if (!binding) {
      binding = `__importSync${bindings.size}`;
      bindings.set(specifier, binding);
    }

    return binding;
  });

  if (bindings.size === 0) return result;

  const names = Array.from(bindings.values()).join(', ');
  const imports = Array.from(
    bindings.keys(),
    (specifier) => `import(${JSON.stringify(withExtension(specifier))})`
  );

  /**
   * A promise reads `then` from the value that it resolves with.
   */
  return (
    `const [${names}] = await Promise.all([${imports.join(', ')}].map((p) => p.catch((e) => ` +
    `new Proxy({}, { get: (_, key) => { if (typeof key === 'string' && key !== 'then') throw e; } }))));\n` +
    result
  );
}

/**
 * The app's bundler resolves `importSync('./x')`, so addons leave out the extension,
 * as in `importSync('./new/map')` in tracked-built-ins.
 * Their other imports name a file.
 *
 * @param {string} specifier
 */
function withExtension(specifier) {
  if (!specifier.startsWith('.')) return specifier;

  const file = specifier.slice(specifier.lastIndexOf('/') + 1);

  if (file === '' || file === '.' || file === '..') {
    return `${specifier.replace(/\/?$/, '/')}index.js`;
  }

  return file.includes('.') ? specifier : `${specifier}.js`;
}

/**
 * Calls of a macro with one or two string literals.
 *
 * @param {string} local
 */
function callsOf(local) {
  return new RegExp(
    `(?<![\\w$.])${local}\\(\\s*(['"])([^'"]+)\\1\\s*(?:,\\s*(['"])([^'"]+)\\3\\s*)?\\)`,
    'g'
  );
}

/**
 * The local name of each macro, which an import can rename.
 *
 * @param {string} code
 */
function localNames(code) {
  /**
   * @type {Map<string, string>}
   */
  const names = new Map();

  for (const match of code.matchAll(MACROS_IMPORT)) {
    for (const part of (match[1] ?? '').split(',')) {
      const [imported, local] = part.trim().split(/\s+as\s+/);

      if (imported) names.set(imported, local ?? imported);
    }
  }

  return names;
}
