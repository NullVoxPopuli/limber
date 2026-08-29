/**
 * Assembly for the build-time `renderToString` output.
 *
 * `renderToString` has to hand back a single self-contained module, so every
 * live demo in a gmd document is compiled to source and inlined next to the
 * prose. Demos are independent modules that know nothing about each other, so
 * merging them means resolving import collisions and top-level name
 * collisions — work that needs real scope information, not text matching.
 *
 * Babel is already loaded and running in this path (the gjs compiler
 * transforms every demo through it), so the merge runs through babel too.
 */

import { assert } from './utils.js';

const PARSER_PLUGINS = ['importAttributes'];

/**
 * @typedef {object} Demo
 * @property {string} name - Identifier the prose invokes, e.g. `Demo1`
 * @property {string} placeholderId - id of the div this demo replaces
 * @property {string} source - The demo's compiled JS module source
 */

/**
 * Inline one or more compiled demo modules into the surrounding gmd prose,
 * producing one self-contained ES module string.
 *
 * The emitted module imports `template` from `@ember/template-compiler` (the
 * build-time form), so the consuming app's babel pipeline precompiles the
 * `template(...)` call to wire format.
 *
 * There is no live scope: a runtime object cannot be written into source, so
 * demos see only what the emitted module itself imports.
 *
 * @param {object} args
 * @param {any} [args.babel] - `@babel/standalone`, required only to inline demos
 * @param {string} args.prose - Markdown rendered to HTML, with demo placeholders
 * @param {Demo[]} [args.demos]
 * @returns {string}
 */
export function buildGmdModule({ babel, prose, demos = [] }) {
  assert(
    `Inlining ${demos.length} live demo(s) needs '@babel/standalone'. ` +
      `Provide it through the compiler's resolve config, the way ember-repl does.`,
    babel || !demos.length
  );

  const imports = new ImportRegistry();
  const templateLocal = imports.use('@ember/template-compiler', 'named', 'template', 'template');

  /** @type {string[]} */
  const declarations = [];
  /** @type {string[]} */
  const demoNames = [];

  let rewrittenProse = prose;

  demos.forEach((demo, index) => {
    const body = inlineDemo({ babel, source: demo.source, index, imports });

    declarations.push(`const ${demo.name} = (() => {\n${indent(body)}\n})();`);
    demoNames.push(demo.name);
    rewrittenProse = replacePlaceholder(rewrittenProse, demo.placeholderId, demo.name);
  });

  const scopeBody = demoNames.length ? `{ ${demoNames.join(', ')} }` : `{}`;

  return (
    `${imports.toSource()}\n\n` +
    (declarations.length ? declarations.join('\n\n') + '\n\n' : '') +
    `const _component = ${templateLocal}(${JSON.stringify(rewrittenProse)}, {\n` +
    `  scope: () => (${scopeBody}),\n` +
    `});\n` +
    `export default _component;\n`
  );
}

/**
 * Strip a demo module down to a body suitable for IIFE-wrapping:
 *
 * - every top-level binding is renamed to a per-demo prefix, so two demos (or
 *   a demo and the prose module) can declare the same name
 * - imports are lifted into the shared registry, and their local references
 *   rewritten to whatever local the registry assigned
 * - `export default X` becomes a `const` the wrapper returns; other exports
 *   lose their `export` keyword and stay as plain declarations
 *
 * @param {object} args
 * @param {any} args.babel
 * @param {string} args.source
 * @param {number} args.index
 * @param {ImportRegistry} args.imports
 * @returns {string}
 */
function inlineDemo({ babel, source, index, imports }) {
  const t = babel.packages.types;
  const resultName = `_demo${index}_default`;

  let hasDefault = false;

  const plugin = () => ({
    visitor: {
      /** @param {any} path */
      Program(path) {
        // Imports first, while their bindings still exist: each specifier is
        // pointed at whatever local the shared registry assigned, so two demos
        // importing the same thing end up on one declaration.
        for (const statement of path.get('body')) {
          if (!statement.isImportDeclaration()) continue;

          const from = statement.node.source.value;

          for (const specifier of statement.node.specifiers) {
            const local = specifier.local.name;
            /** @type {string} */
            let shared;

            if (t.isImportDefaultSpecifier(specifier)) {
              shared = imports.use(from, 'default', null, local);
            } else if (t.isImportNamespaceSpecifier(specifier)) {
              shared = imports.use(from, 'namespace', null, local);
            } else {
              const imported = specifier.imported;
              const name = t.isIdentifier(imported) ? imported.name : imported.value;

              shared = imports.use(from, 'named', name, name);
            }

            path.scope.rename(local, shared);
          }

          statement.remove();
        }

        // Whatever the demo declares for itself gets a per-demo prefix, so two
        // demos can each define `value` (or `Greeting`) without colliding once
        // both bodies live in the same module. Crawl first: the import
        // bindings are gone now, and those names must stay as the registry
        // assigned them.
        path.scope.crawl();

        for (const name of Object.keys(path.scope.bindings)) {
          path.scope.rename(name, `_demo${index}_${name}`);
        }

        for (const statement of path.get('body')) {
          if (statement.isExportDefaultDeclaration()) {
            hasDefault = true;

            const declaration = statement.node.declaration;
            const expression =
              t.isFunctionDeclaration(declaration) || t.isClassDeclaration(declaration)
                ? t.toExpression(declaration)
                : declaration;

            statement.replaceWith(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier(resultName), expression),
              ])
            );
            continue;
          }

          if (statement.isExportNamedDeclaration()) {
            if (statement.node.declaration) {
              statement.replaceWith(statement.node.declaration);
            } else {
              statement.remove();
            }

            continue;
          }

          if (statement.isExportAllDeclaration()) {
            statement.remove();
          }
        }
      },
    },
  });

  const result = babel.transform(source, {
    plugins: [plugin],
    sourceType: 'module',
    configFile: false,
    babelrc: false,
    compact: false,
    parserOpts: { plugins: PARSER_PLUGINS },
  });

  const code = result?.code ?? '';

  return hasDefault ? `${code}\n\nreturn ${resultName};` : code;
}

/**
 * @typedef {object} ImportEntry
 * @property {string} from
 * @property {'default' | 'namespace' | 'named'} kind
 * @property {string | null} imported
 * @property {string} local
 */

/**
 * Collects every import the merged module needs, collapsing repeats.
 *
 * Two demos importing the same binding from the same module share one local.
 * The same name from *different* modules is suffixed rather than merged.
 */
class ImportRegistry {
  /** @type {Map<string, string>} */
  #byKey = new Map();

  /** @type {Set<string>} */
  #taken = new Set();

  /** @type {ImportEntry[]} */
  #entries = [];

  /**
   * @param {string} from
   * @param {'default' | 'namespace' | 'named'} kind
   * @param {string | null} imported
   * @param {string} [preferred] - name the source module used, kept when free
   * @returns {string} the local identifier to reference this import by
   */
  use(from, kind, imported, preferred) {
    const key = JSON.stringify([from, kind, imported]);
    const existing = this.#byKey.get(key);

    if (existing) return existing;

    const local = this.#claim(preferred ? toIdentifier(preferred) : preferredName(from, kind));

    this.#byKey.set(key, local);
    this.#entries.push({ from, kind, imported, local });

    return local;
  }

  /**
   * @param {string} preferred
   */
  #claim(preferred) {
    if (!this.#taken.has(preferred)) {
      this.#taken.add(preferred);

      return preferred;
    }

    let n = 1;

    while (this.#taken.has(`${preferred}$${n}`)) n++;

    const local = `${preferred}$${n}`;

    this.#taken.add(local);

    return local;
  }

  /**
   * @returns {string}
   */
  toSource() {
    /** @type {Map<string, ImportEntry[]>} */
    const bySource = new Map();

    for (const entry of this.#entries) {
      const group = bySource.get(entry.from) ?? [];

      group.push(entry);
      bySource.set(entry.from, group);
    }

    /** @type {string[]} */
    const lines = [];

    for (const [from, group] of bySource) {
      const namespaces = group.filter((e) => e.kind === 'namespace');
      const defaults = group.filter((e) => e.kind === 'default');
      const named = group.filter((e) => e.kind === 'named');

      // A namespace import cannot share a declaration with named imports
      for (const entry of namespaces) {
        lines.push(`import * as ${entry.local} from '${from}';`);
      }

      const clauses = [];

      if (defaults[0]) clauses.push(defaults[0].local);

      if (named.length) {
        const specifiers = named.map((e) =>
          e.imported === e.local ? e.local : `${e.imported} as ${e.local}`
        );

        clauses.push(`{ ${specifiers.join(', ')} }`);
      }

      if (clauses.length) {
        lines.push(`import ${clauses.join(', ')} from '${from}';`);
      }
    }

    return lines.join('\n');
  }
}

/**
 * @param {string} from
 * @param {string} kind
 */
function preferredName(from, kind) {
  const base = toIdentifier(from.split('/').filter(Boolean).pop() ?? 'mod');

  return kind === 'namespace' ? `${base}Ns` : base;
}

/**
 * @param {string} value
 */
function toIdentifier(value) {
  const cleaned = value.replace(/[^\w$]/g, '_').replace(/^(\d)/, '_$1');

  return cleaned || '_mod';
}

/**
 * Replace the `<div id="${id}" class="…"></div>` placeholder emitted by
 * `liveCodeExtraction` with a Glimmer component invocation.
 *
 * The placeholder div is preserved (sans `id`) so `repl-sdk__demo` styling
 * still applies, and the inner `data-repl-output` div matches the DOM the
 * runtime path produces, so callers can find demos the same way in both.
 *
 * @param {string} html
 * @param {string} id
 * @param {string} name
 */
export function replacePlaceholder(html, id, name) {
  const escapedId = id.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const pattern = new RegExp(
    `<div\\s+id="${escapedId}"(\\s+class="([^"]*)")?[^>]*>\\s*</div>`,
    'g'
  );

  return html.replace(pattern, (_match, _attr, classes) => {
    const classAttr = classes !== undefined ? ` class="${classes}"` : '';

    return `<div${classAttr}><div data-repl-output><${name} /></div></div>`;
  });
}

/**
 * @param {string} text
 */
function indent(text) {
  return text
    .split('\n')
    .map((line) => (line.trim() ? `  ${line}` : line))
    .join('\n');
}
