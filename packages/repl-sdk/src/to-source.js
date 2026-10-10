/**
 * Builds the module that `compileToSource` returns for a gmd document.
 *
 * The result is one module, so each live demo is inline, next to the prose.
 * Demos are separate modules that know nothing about each other.
 * A merge has to resolve import collisions and name collisions,
 * and that needs real scope information. Text matching can not do it.
 *
 * Babel is already loaded here (the gjs compiler uses it for each demo),
 * so the merge uses babel too.
 */

import { assert } from './utils.js';

const PARSER_PLUGINS = ['decorators'];

/**
 * @typedef {object} Demo
 * @property {string} name - Identifier the prose invokes, e.g. `Demo1`
 * @property {string} placeholderId - id of the div this demo replaces
 * @property {string} source - The demo's compiled JS module source
 */

/**
 * Puts the demos of a gmd document inline with its prose.
 * Returns the source of one ES module.
 *
 * The module imports `template` from `@ember/template-compiler`,
 * so the build of the app that uses the module compiles the prose.
 *
 * There is no live scope, because source can not hold a runtime object.
 * A demo has access to what it imports, and nothing else.
 *
 * @param {object} args
 * @param {any} [args.babel] - `@glimdown/babel-8-lite` or `@babel/standalone`. Only necessary when there are demos.
 * @param {string} args.prose - Markdown rendered to HTML, with demo placeholders
 * @param {Demo[]} [args.demos]
 * @returns {string}
 */
export function buildGmdModule({ babel, prose, demos = [] }) {
  assert(
    `Inlining ${demos.length} live demo(s) needs babel. ` +
      `Pass '@glimdown/babel-8-lite' or '@babel/standalone' as \`babel\`.`,
    babel || !demos.length
  );

  const imports = new ImportRegistry();
  const templateLocal = imports.use('@ember/template-compiler', 'named', 'template', 'template');

  for (const demo of demos) {
    imports.reserve(demo.name);
  }

  /** @type {string[]} */
  const declarations = [];
  /** @type {string[]} */
  const demoNames = [];

  let rewrittenProse = prose;

  demos.forEach((demo, index) => {
    const body = inlineDemo({ babel, source: demo.source, index, imports });

    declarations.push(`const ${demo.name} = (() => {\n${body}\n})();`);
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
 * Changes a demo module into the body of a function that returns its default export.
 *
 * - `export default` becomes a `const` that the function returns.
 *   Other exports lose the `export` keyword.
 * - each top-level name gets a prefix for this demo,
 *   so a name in a demo can not collide with an import of another demo
 * - imports move to the shared registry,
 *   and references change to the local name that the registry gave
 *
 * The order is important.
 * Babel splits `export default class X {}` in two when it renames `X`,
 * so the exports go first.
 * Imports go last, so that an import can take a name that a demo also declared.
 *
 * @param {object} args
 * @param {any} args.babel
 * @param {string} args.source
 * @param {number} args.index
 * @param {ImportRegistry} args.imports
 * @returns {string}
 */
function inlineDemo({ babel, source, index, imports }) {
  const prefix = `_demo${index}_`;
  const resultName = `${prefix}default`;

  let hasDefault = false;

  /** @param {{ types: any }} api */
  const plugin = ({ types: t }) => ({
    visitor: {
      /** @param {any} path */
      Program(path) {
        /** @param {any} expression */
        const result = (expression) => {
          hasDefault = true;

          return t.variableDeclaration('const', [
            t.variableDeclarator(t.identifier(resultName), expression),
          ]);
        };

        for (const statement of path.get('body')) {
          if (statement.isExportDefaultDeclaration()) {
            const declaration = statement.node.declaration;
            const isDeclaration =
              t.isFunctionDeclaration(declaration) || t.isClassDeclaration(declaration);

            if (isDeclaration && declaration.id) {
              /** The declaration stays a declaration, because the demo can refer to it by name. */
              statement.replaceWith(declaration);
              path.pushContainer('body', result(t.identifier(declaration.id.name)));
            } else {
              statement.replaceWith(
                result(isDeclaration ? t.toExpression(declaration) : declaration)
              );
            }

            continue;
          }

          if (statement.isExportNamedDeclaration()) {
            const { declaration, specifiers, source: from } = statement.node;

            if (declaration) {
              statement.replaceWith(declaration);
              continue;
            }

            /** `export { X as default };` */
            const main = from
              ? undefined
              : specifiers.find((/** @type {any} */ specifier) => {
                  const { exported } = specifier;

                  return (t.isIdentifier(exported) ? exported.name : exported.value) === 'default';
                });

            if (main) {
              path.pushContainer('body', result(t.identifier(main.local.name)));
            }

            statement.remove();
            continue;
          }

          if (statement.isExportAllDeclaration()) {
            statement.remove();
          }
        }

        path.scope.crawl();

        for (const [name, binding] of Object.entries(path.scope.bindings)) {
          if (/** @type {any} */ (binding).kind === 'module') continue;
          if (name === resultName) continue;

          path.scope.rename(name, `${prefix}${name}`);
        }

        for (const statement of path.get('body')) {
          if (!statement.isImportDeclaration()) continue;

          const from = statement.node.source.value;

          if (!statement.node.specifiers.length) {
            imports.sideEffect(from);
          }

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

            if (shared !== local) {
              path.scope.rename(local, shared);
            }
          }

          statement.remove();
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
 * @property {'default' | 'namespace' | 'named' | 'side-effect'} kind
 * @property {string | null} imported
 * @property {string} local
 */

/**
 * Collects each import that the merged module needs.
 *
 * - the same binding from the same module, in two demos: one local name
 * - the same name from two modules: the second one gets a suffix
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
   * An import that has no bindings, like `import './setup.js';`
   *
   * @param {string} from
   */
  sideEffect(from) {
    const key = JSON.stringify([from, 'side-effect']);

    if (this.#byKey.has(key)) return;

    this.#byKey.set(key, '');
    this.#entries.push({ from, kind: 'side-effect', imported: null, local: '' });
  }

  /**
   * Keeps a name away from the imports, because the module declares it.
   *
   * @param {string} name
   */
  reserve(name) {
    this.#taken.add(name);
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

      /** A namespace import cannot share a declaration with named imports */
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
      } else if (!namespaces.length) {
        lines.push(`import '${from}';`);
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
 * Changes the placeholder of a demo into an invocation of its component.
 * `liveCodeExtraction` wrote the placeholder: `<div id="${id}" class="…"></div>`
 *
 * The div stays, without its `id`, so the `repl-sdk__demo` styles still apply.
 *
 * The inner `data-repl-output` div is the same as what the runtime renders.
 * A caller can find demos the same way in both.
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
