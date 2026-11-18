/**
 * @typedef {import('../../types.ts').Plugin} Plugin
 */

const MACROS_IMPORT = /import\s*\{([^}]*)\}\s*from\s*['"]@embroider\/macros['"]/g;

/**
 * Turns `importSync('x')` into an import of `x`, so that the loader follows it like any import.
 * A build does this too, after it removes the branches that a macro condition rules out.
 * The REPL keeps every branch, so a module that does not load only throws when code reads from it.
 *
 * @param {string} code
 * @returns {string | undefined}
 */
export function rewriteImportSync(code) {
  if (!code.includes('@embroider/macros')) return;

  /**
   * @type {Map<string, string>}
   */
  const bindings = new Map();
  let result = code;

  for (const name of localNames(code)) {
    const call = new RegExp(`(?<![\\w$.])${name}\\(\\s*(['"])([^'"]+)\\1\\s*\\)`, 'g');

    result = result.replace(call, (_call, _quote, specifier) => {
      let binding = bindings.get(specifier);

      if (!binding) {
        binding = `__importSync${bindings.size}`;
        bindings.set(specifier, binding);
      }

      return binding;
    });
  }

  if (bindings.size === 0) return;

  const names = Array.from(bindings.values()).join(', ');
  const imports = Array.from(
    bindings.keys(),
    (specifier) => `import(${JSON.stringify(specifier)})`
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
 * The local names of `importSync`, which an import can rename.
 *
 * @param {string} code
 */
function localNames(code) {
  /**
   * @type {Set<string>}
   */
  const names = new Set();

  for (const match of code.matchAll(MACROS_IMPORT)) {
    for (const part of (match[1] ?? '').split(',')) {
      const [imported, local] = part.trim().split(/\s+as\s+/);

      if (imported === 'importSync') names.add(local ?? imported);
    }
  }

  return names;
}

/**
 * @type {Plugin}
 */
export const importSync = {
  name: 'repl-sdk:ember:import-sync',

  transform(code) {
    return rewriteImportSync(code);
  },
};
