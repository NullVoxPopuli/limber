/**
 * Shared helpers for the build-time `renderToString` code path.
 *
 * The job of these helpers is purely lexical — given the JS source emitted by
 * a sub-compiler (e.g. gjs/hbs), split it into top-level imports + body so
 * the caller (e.g. `gmd`) can merge many such modules into one self-contained
 * module string that the host app's own bundler will then process.
 *
 * Nothing here parses JS into an AST — the input is expected to be the
 * deterministic output of babel + content-tag, where imports are top-level
 * and the module ends with a single `export default <expr>;`.
 */

/**
 * @typedef {object} ModuleParts
 * @property {string[]} imports - Top-level import statements (each ending in `;`)
 * @property {string} body - Remaining module body with imports removed and
 *   `export default <expr>;` rewritten to `return <expr>;`
 */

/**
 * Split a JS module source into its top-level import statements and the rest
 * of its body, rewriting any trailing `export default <expr>;` to a `return`
 * so the body is suitable for IIFE-wrapping.
 *
 * Multi-line imports (`import {\n  a,\n  b\n} from 'x';`) are supported by
 * brace-balanced continuation across lines.
 *
 * @param {string} source
 * @returns {ModuleParts}
 */
export function splitModule(source) {
  const lines = source.split('\n');
  /** @type {string[]} */
  const imports = [];
  /** @type {string[]} */
  const bodyLines = [];

  let i = 0;

  while (i < lines.length) {
    const line = /** @type {string} */ (lines[i]);

    if (!isImportStart(line)) {
      bodyLines.push(line);
      i++;
      continue;
    }

    let chunk = line;
    let depth = braceDelta(line);
    let parenDepth = parenDelta(line);

    while (
      i + 1 < lines.length &&
      (depth > 0 || parenDepth > 0 || !chunk.trimEnd().endsWith(';'))
    ) {
      i++;

      const next = /** @type {string} */ (lines[i]);

      chunk += '\n' + next;
      depth += braceDelta(next);
      parenDepth += parenDelta(next);
    }

    imports.push(chunk);
    i++;
  }

  const body = rewriteDefaultExport(bodyLines.join('\n'));

  return { imports, body };
}

/**
 * @param {string} line
 */
function isImportStart(line) {
  return /^\s*import(\s|\s*['"`{*])/.test(line);
}

/**
 * Count `{` − `}` in a line, ignoring chars inside strings or line comments.
 * Good enough for the small set of characters babel emits inside an import
 * statement (no template literals, no regex literals).
 *
 * @param {string} line
 */
function braceDelta(line) {
  return countCharsOutsideStrings(line, '{', '}');
}

/**
 * @param {string} line
 */
function parenDelta(line) {
  return countCharsOutsideStrings(line, '(', ')');
}

/**
 * @param {string} line
 * @param {string} open
 * @param {string} close
 */
function countCharsOutsideStrings(line, open, close) {
  let depth = 0;
  /** @type {string | null} */
  let stringChar = null;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (stringChar) {
      if (ch === '\\') {
        i++;
        continue;
      }

      if (ch === stringChar) {
        stringChar = null;
      }

      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      stringChar = ch;
      continue;
    }

    if (ch === '/' && line[i + 1] === '/') break;

    if (ch === open) depth++;
    else if (ch === close) depth--;
  }

  return depth;
}

/**
 * Rewrite the final `export default <expr>;` to `return <expr>;` so the
 * caller can wrap the body in an IIFE.
 *
 * If there is no `export default`, the body is returned unchanged.
 *
 * @param {string} body
 * @returns {string}
 */
function rewriteDefaultExport(body) {
  // Anchor with `/m` so we only match `export default` at the start of a
  // statement line — never inside line comments, strings, or expressions.
  // Babel never emits multiple top-level `export default`s, so first-match
  // semantics are fine.
  const match = body.match(/^\s*export\s+default\s+/m);

  if (!match || match.index === undefined) {
    return body;
  }

  const before = body.slice(0, match.index);
  const after = body.slice(match.index + match[0].length);

  return `${before}return ${after}`;
}

/**
 * Deduplicate a list of import statements by their exact textual content
 * (after trimming trailing whitespace). This is intentionally conservative —
 * we'd rather emit two equivalent-but-different imports than collapse two
 * imports that bind different things.
 *
 * @param {string[][]} groups
 * @returns {string[]}
 */
export function mergeImports(groups) {
  const seen = new Set();
  /** @type {string[]} */
  const out = [];

  for (const group of groups) {
    for (const imp of group) {
      const key = imp.trim();

      if (seen.has(key)) continue;

      seen.add(key);
      out.push(imp);
    }
  }

  return out;
}

/**
 * Wrap a module body in an IIFE that returns the (rewritten) default export.
 *
 * @param {string} body
 * @param {string} name
 */
export function wrapAsConst(body, name) {
  return `const ${name} = (() => {\n${indent(body)}\n})();`;
}

/**
 * @param {string} text
 */
function indent(text) {
  return text
    .split('\n')
    .map((line) => (line.length ? `  ${line}` : line))
    .join('\n');
}

/**
 * Inline one or more compiled sub-modules into the surrounding gmd prose.
 *
 * Given the markdown body (with `<div id="placeholderId"></div>` holes from
 * `liveCodeExtraction`) and a list of `{ name, placeholderId, source }`
 * entries (one per live demo), produce a single `.gjs`-shaped module:
 *
 *   - All top-level demo imports merged + deduped at the top
 *   - Plus `import { template } from '@ember/template-compiler';`
 *   - Each demo body wrapped in `const <name> = (() => { …; return X; })();`
 *   - A trailing `template(prose, { scope: () => ({ …names… }) })` call
 *
 * The placeholders in `prose` are replaced with `<name />` Glimmer
 * invocations referencing each inlined demo.
 *
 * This is a pure function — the caller (e.g. `gmd.js`) is responsible for
 * driving the sub-compiles.
 *
 * @param {object} args
 * @param {string} args.prose
 * @param {Array<{ name: string, placeholderId: string, source: string }>} args.demos
 * @returns {string}
 */
export function buildGmdModule({ prose, demos }) {
  /** @type {string[][]} */
  const importGroups = [[`import { template } from '@ember/template-compiler';`]];
  /** @type {string[]} */
  const bodyDecls = [];
  /** @type {string[]} */
  const scopeIdents = [];

  let rewrittenProse = prose;

  for (const demo of demos) {
    const { imports, body } = splitModule(demo.source);

    importGroups.push(imports);
    bodyDecls.push(wrapAsConst(body, demo.name));
    scopeIdents.push(demo.name);

    rewrittenProse = replacePlaceholder(rewrittenProse, demo.placeholderId, demo.name);
  }

  const mergedImports = mergeImports(importGroups).join('\n');
  const scopeBody = scopeIdents.length ? `{ ${scopeIdents.join(', ')} }` : `{}`;

  return (
    `${mergedImports}\n\n` +
    (bodyDecls.length ? bodyDecls.join('\n\n') + '\n\n' : '') +
    `const _component = template(${JSON.stringify(rewrittenProse)}, {\n` +
    `  scope: () => (${scopeBody}),\n` +
    `});\n` +
    `export default _component;\n`
  );
}

/**
 * Replace the single `<div id="${id}" …></div>` placeholder emitted by
 * `liveCodeExtraction` with a Glimmer component invocation `<${name} />`.
 *
 * The placeholder element has no inner text and may carry arbitrary class
 * attributes; we only need to match it by id.
 *
 * @param {string} html
 * @param {string} id
 * @param {string} name
 */
export function replacePlaceholder(html, id, name) {
  const escaped = id.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const pattern = new RegExp(`<div\\s+id="${escaped}"[^>]*>\\s*</div>`, 'g');

  return html.replace(pattern, `<${name} />`);
}
