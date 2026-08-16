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
  const topLevel = topLevelMask(source);
  /** @type {string[]} */
  const imports = [];
  /** @type {string[]} */
  const bodyLines = [];

  let i = 0;
  let offset = 0;

  while (i < lines.length) {
    const line = /** @type {string} */ (lines[i]);
    const lineStart = offset;

    offset += line.length + 1;

    // A demo that quotes Ember code (the "build your own REPL" sample assigns
    // a whole component to a template literal) has `import …` at column 0
    // inside that literal. Hoisting those lines out silently strips the
    // quoted module's own imports, so gate on real top-level position.
    if (!isImportStart(line) || !isTopLevelAt(topLevel, lineStart + indentOf(line))) {
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

      offset += next.length + 1;
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
  const found = findTopLevelExportDefault(body);

  if (!found) {
    return body;
  }

  const before = body.slice(0, found.index);
  const after = body.slice(found.index + found.length);

  return `${before}return ${after}`;
}

/**
 * Locate the module's own `export default`, skipping any that appear inside
 * strings, template literals, or comments.
 *
 * A line-anchored regex is not enough: a demo that shows Ember code as a
 * string (the "build your own REPL" sample assigns a whole component to a
 * template literal) has `export default` at column 0 *inside* that literal.
 * Rewriting there corrupts the string and leaves the real export in place,
 * so the IIFE wrapper dies with "Unexpected token 'export'".
 *
 * @param {string} body
 * @returns {{ index: number, length: number } | null}
 */
function findTopLevelExportDefault(body) {
  const topLevel = topLevelMask(body);
  const pattern = /export\s+default\s+/g;

  /** @type {RegExpExecArray | null} */
  let match;

  while ((match = pattern.exec(body)) !== null) {
    if (isTopLevelAt(topLevel, match.index) && !isWordChar(body[match.index - 1])) {
      return { index: match.index, length: match[0].length };
    }
  }

  return null;
}

/**
 * Mark every offset in `source` that sits in top-level module code — outside
 * any string, template literal, or comment, and at brace depth zero.
 *
 * Everything that rewrites a module by position depends on this: both the
 * import hoist and the `export default` rewrite would otherwise fire on text
 * that merely looks like code because a demo quoted it.
 *
 * @param {string} source
 * @returns {Uint8Array}
 */
function topLevelMask(source) {
  const mask = new Uint8Array(source.length);
  /** @type {Array<{ type: 'code' | 'sq' | 'dq' | 'tpl', depth: number }>} */
  const stack = [{ type: 'code', depth: 0 }];
  let i = 0;

  while (i < source.length) {
    const top = /** @type {{ type: string, depth: number }} */ (stack[stack.length - 1]);
    const ch = source[i];

    if (top.type === 'sq' || top.type === 'dq') {
      if (ch === '\\') {
        i += 2;
        continue;
      }

      if ((top.type === 'sq' && ch === "'") || (top.type === 'dq' && ch === '"')) {
        stack.pop();
      }

      i++;
      continue;
    }

    if (top.type === 'tpl') {
      if (ch === '\\') {
        i += 2;
        continue;
      }

      if (ch === '`') {
        stack.pop();
        i++;
        continue;
      }

      // `${` opens a nested code context that can itself contain strings
      if (ch === '$' && source[i + 1] === '{') {
        stack.push({ type: 'code', depth: 0 });
        i += 2;
        continue;
      }

      i++;
      continue;
    }

    if (ch === '/' && source[i + 1] === '/') {
      const newline = source.indexOf('\n', i);

      i = newline === -1 ? source.length : newline;
      continue;
    }

    if (ch === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);

      i = end === -1 ? source.length : end + 2;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      stack.push({ type: ch === "'" ? 'sq' : ch === '"' ? 'dq' : 'tpl', depth: 0 });
      i++;
      continue;
    }

    if (ch === '{') {
      top.depth++;
      i++;
      continue;
    }

    if (ch === '}') {
      // depth 0 inside a nested context means this `}` closes a `${`
      if (top.depth === 0 && stack.length > 1) {
        stack.pop();
      } else {
        top.depth--;
      }

      i++;
      continue;
    }

    if (stack.length === 1 && top.depth === 0) {
      mask[i] = 1;
    }

    i++;
  }

  return mask;
}

/**
 * @param {Uint8Array} mask
 * @param {number} index
 */
function isTopLevelAt(mask, index) {
  return mask[index] === 1;
}

/**
 * Offset of the first non-whitespace character on a line.
 *
 * @param {string} line
 */
function indentOf(line) {
  const match = /\S/.exec(line);

  return match ? match.index : 0;
}

/**
 * @param {string | undefined} ch
 */
function isWordChar(ch) {
  return ch !== undefined && /[\w$]/.test(ch);
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
 * Inline one or more compiled sub-modules into the surrounding gmd prose,
 * producing one self-contained ES module string.
 *
 * The same function is used by both the *runtime* compile path (the module
 * gets blob-eval'd and rendered) and the *renderToString* path (the module
 * gets handed back to the caller's bundler). The only differences are:
 *
 *   - `templateModule`: which `template` to import. Use
 *     `'@ember/template-compiler/runtime'` when this module will be
 *     evaluated at runtime, or `'@ember/template-compiler'` when a build-
 *     time babel plugin is expected to precompile the `template(...)` call.
 *
 *   - `scope`: a virtual ES module specifier that the emitted module will
 *     `import * as __scope__ from '<specifier>'`, and the list of keys to
 *     destructure off that namespace. The runtime path registers the live
 *     scope object behind such a specifier via `api.provide`; the
 *     renderToString path passes `null` because there is no live scope to
 *     bridge.
 *
 * The placeholders in `prose` are replaced with `<name />` Glimmer
 * invocations wrapped in a div that preserves the original placeholder's
 * `class` attribute (e.g. `repl-sdk__demo`) so existing CSS still applies.
 *
 * This is a pure function — the caller is responsible for driving the
 * sub-compiles and (for the runtime path) for registering the scope value
 * behind `scope.specifier` before this output is evaluated.
 *
 * @param {object} args
 * @param {string} args.prose
 * @param {Array<{ name: string, placeholderId: string, source: string }>} args.demos
 * @param {string} [args.templateModule]
 * @param {{ specifier: string, keys: string[] } | null} [args.scope]
 * @returns {string}
 */
export function buildGmdModule({
  prose,
  demos,
  templateModule = '@ember/template-compiler',
  scope = null,
}) {
  /** @type {string[][]} */
  const importGroups = [[`import { template } from '${templateModule}';`]];

  if (scope && scope.keys.length) {
    importGroups.push([`import * as __scope__ from '${scope.specifier}';`]);
  }

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

  // Scope keys stay behind `__scope__.` rather than being destructured into
  // module scope. Demo imports are hoisted into this same module, and the
  // default scope keys (`on`, `fn`, `get`, `hash`, `array`, `concat`) are
  // exactly the names a demo is most likely to import from `@ember/modifier`
  // or `@ember/helper` — destructuring makes that pair a duplicate
  // declaration and the whole module dies with a SyntaxError.
  const scopeEntries =
    scope && scope.keys.length ? scope.keys.map((key) => `${key}: __scope__.${key}`) : [];
  const allScopeEntries = [...scopeEntries, ...scopeIdents];
  const scopeBody = allScopeEntries.length ? `{ ${allScopeEntries.join(', ')} }` : `{}`;

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
 * Replace the single `<div id="${id}" class="…"></div>` placeholder emitted
 * by `liveCodeExtraction` with a Glimmer component invocation. The wrapping
 * div is preserved (sans `id`) so the `repl-sdk__demo` (or
 * caller-supplied) class still styles the demo container.
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

    // The inner `data-repl-output` div keeps the DOM shape a separately
    // rendered island used to produce: callers (and tests) count these to
    // find rendered demos, and inlining the demo must not change what they
    // see.
    return `<div${classAttr}><div data-repl-output><${name} /></div></div>`;
  });
}
