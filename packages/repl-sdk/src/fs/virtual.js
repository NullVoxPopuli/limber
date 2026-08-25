/**
 * Modules that are already a live JS object: something the host app handed to
 * `options.resolve`, or a loader a compiler config supplied. There is no file
 * to serve, so we generate one that reads the object back out of the global
 * the Compiler stashes it in.
 *
 * Export names are emitted as string literals rather than identifiers. Export
 * names are not required to be identifiers, and real packages use that:
 * `svelte/internal/client` exports one called `await`, which is what made
 * bundling svelte fail before.
 *
 * @param {string} name
 * @param {object} value the resolved module
 * @param {string} globalKey the Symbol.for key the value is stashed under
 * @returns {string}
 */
export function virtualModuleSource(name, value, globalKey) {
  const quotedName = JSON.stringify(name);
  const lookup = `globalThis[Symbol.for(${JSON.stringify(globalKey)})].resolves?.[${quotedName}]`;

  const lines = [
    `const mod = ${lookup};`,
    ``,
    `if (!mod) { throw new Error(${JSON.stringify(`Could not resolve \`${name}\`. Does the module exist?`)}); }`,
    ``,
  ];

  /** @type {string[]} */
  const bindings = [];

  Object.keys(value).forEach((exportName, index) => {
    if (exportName === 'default') return;

    const local = `_${index}`;

    lines.push(`const ${local} = mod[${JSON.stringify(exportName)}];`);
    bindings.push(`${local} as ${JSON.stringify(exportName)}`);
  });

  if (bindings.length) {
    lines.push(``, `export { ${bindings.join(', ')} };`);
  }

  /**
   * Not every one of these is real ESM, so fall back to the whole object.
   */
  lines.push(`export default mod.default ?? mod;`);

  return lines.join('\n');
}
