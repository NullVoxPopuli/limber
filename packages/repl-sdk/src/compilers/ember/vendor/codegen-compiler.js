// @ts-nocheck
/* eslint-disable */
/**
 * VENDORED -- do not edit.
 *
 * The template compiler for the codegen flavor (babel plugin + code generator).
 * Built from https://github.com/NullVoxPopuli-ai-agent/ember.js/tree/claude/gallant-heisenberg-aovzyr (2b03eb8).
 *
 * This is an experiment: strict-mode templates compiled directly to DOM
 * operations, with no wire format and no VM.
 */

// packages/@glimmer/compiler/lib/codegen/generate.ts
var CodegenError = class extends Error {
  constructor(message, node) {
    let loc = node?.loc;
    let where = loc?.startPosition ? ` (line ${loc.startPosition.line}, column ${loc.startPosition.column})` : "";
    super(`${message}${where}`);
    this.name = "CodegenError";
  }
};
var VOID_ELEMENTS = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
var KEYWORDS = /* @__PURE__ */ new Set([
  "action",
  "component",
  "debugger",
  "each",
  "each-in",
  "has-block",
  "has-block-params",
  "helper",
  "if",
  "in-element",
  "let",
  "log",
  "modifier",
  "mount",
  "mut",
  "outlet",
  "readonly",
  "unbound",
  "unless",
  "yield"
]);
var AUTO_IMPORTED = {
  and: "@ember/helper",
  array: "@ember/helper",
  element: "@ember/helper",
  eq: "@ember/helper",
  fn: "@ember/helper",
  gt: "@ember/helper",
  gte: "@ember/helper",
  hash: "@ember/helper",
  lt: "@ember/helper",
  lte: "@ember/helper",
  neq: "@ember/helper",
  not: "@ember/helper",
  on: "@ember/modifier",
  or: "@ember/helper"
};
var SPECIALIZED = {
  "@ember/helper": /* @__PURE__ */ new Set([
    "and",
    "array",
    "concat",
    "eq",
    "fn",
    "get",
    "gt",
    "gte",
    "hash",
    "lt",
    "lte",
    "neq",
    "not",
    "or"
  ]),
  "@ember/modifier": /* @__PURE__ */ new Set(["on"])
};
var COMPARISONS = {
  eq: "===",
  neq: "!==",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<="
};
var IDENTIFIER = /^[A-Za-z_$][\w$]*$/u;
var q = (value) => JSON.stringify(value);
function key(name) {
  return IDENTIFIER.test(name) ? name : q(name);
}
function prop(name) {
  return IDENTIFIER.test(name) ? `.${name}` : `[${q(name)}]`;
}
function escapeText(text) {
  return text.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;");
}
function escapeAttr(text) {
  return text.replace(/&/gu, "&amp;").replace(/"/gu, "&quot;");
}
var Scope = class _Scope {
  constructor(parent) {
    this.parent = parent;
  }
  parent;
  #names = /* @__PURE__ */ new Map();
  bind(name, js) {
    this.#names.set(name, js);
  }
  lookup(name) {
    return this.#names.get(name) ?? this.parent?.lookup(name);
  }
  child() {
    return new _Scope(this);
  }
};
var Generator = class {
  constructor(options) {
    this.options = options;
  }
  options;
  #uid = 0;
  #hoisted = [];
  #html = /* @__PURE__ */ new Map();
  get hoisted() {
    return this.#hoisted;
  }
  uid(prefix) {
    return `$_${this.options.prefix ?? ""}${prefix}${++this.#uid}`;
  }
  rt(name) {
    return this.options.runtime(name);
  }
  template(ast) {
    let scope = new Scope(null);
    let body = this.body(ast.body, scope);
    return `${this.rt("template")}(($_b, $_ctx) => {
const $_s = $_ctx.self, $_a = $_ctx.args;
${body}
})`;
  }
  /////////////////////////////////////////////////////////////////////////
  // Blocks of content
  /////////////////////////////////////////////////////////////////////////
  /**
   * Generate a function body that renders `statements`, and returns the DOM.
   */
  body(statements, scope) {
    let body = { lines: [], scope };
    let ops = [];
    let markup = this.html(statements, [], ops, body);
    let root = this.uid("r");
    body.lines.push(`const ${root} = ${this.rt("clone")}($_b, ${this.hoistHTML(markup)});`);
    let refs = ops.map((op) => {
      let ref = this.uid("n");
      body.lines.push(`const ${ref} = ${this.rt("at")}(${[root, ...op.path].join(", ")});`);
      return ref;
    });
    ops.forEach((op, i) => {
      let ref = refs[i];
      if (op.kind === "element") {
        this.elementOps(op.node, ref, body);
      } else {
        this.slot(op.node, ref, body);
      }
    });
    body.lines.push(`return ${root};`);
    return body.lines.join("\n");
  }
  blockFn(block, scope) {
    if (!block) return "undefined";
    return this.blockFnWith(block.body, block.blockParams, scope);
  }
  blockFnWith(statements, params, scope, bindParam) {
    let inner = scope.child();
    let names = params.map((name, i) => {
      let id = this.uid("p");
      if (bindParam) {
        bindParam(id, i, inner);
      } else {
        inner.bind(name, `${id}()`);
      }
      return id;
    });
    return `($_b${names.map((n) => `, ${n}`).join("")}) => {
${this.body(statements, inner)}
}`;
  }
  hoistHTML(markup) {
    let existing = this.#html.get(markup);
    if (existing) return existing;
    let id = this.uid("t");
    this.#hoisted.push(`const ${id} = ${this.rt("html")}(${q(markup)});`);
    this.#html.set(markup, id);
    return id;
  }
  /**
   * Build the static HTML for a list of statements, recording the dynamic
   * parts (and the child-index path to their node) in `ops`.
   */
  html(statements, path, ops, body) {
    let out = "";
    let index = 0;
    let text = null;
    let flushText = () => {
      if (text) {
        out += escapeText(text);
        index++;
      }
      text = null;
    };
    for (let statement of statements) {
      switch (statement.type) {
        case "TextNode":
          text = (text ?? "") + statement.chars;
          break;
        case "MustacheCommentStatement":
          break;
        case "CommentStatement":
          flushText();
          out += `<!--${statement.value}-->`;
          index++;
          break;
        case "MustacheStatement": {
          let literal = staticText(statement);
          if (literal !== null) {
            text = (text ?? "") + literal;
            break;
          }
          flushText();
          out += "<!>";
          ops.push({ kind: "slot", path: [...path, index++], node: statement });
          break;
        }
        case "BlockStatement":
          flushText();
          out += "<!>";
          ops.push({ kind: "slot", path: [...path, index++], node: statement });
          break;
        case "ElementNode":
          flushText();
          if (this.isComponent(statement, body.scope)) {
            out += "<!>";
            ops.push({ kind: "slot", path: [...path, index++], node: statement });
          } else {
            out += this.element(statement, [...path, index++], ops, body);
          }
          break;
      }
    }
    flushText();
    return out;
  }
  element(node, path, ops, body) {
    let { tag } = node;
    let out = `<${tag}`;
    let dynamic = node.modifiers.length > 0;
    let splatted = false;
    for (let attr of node.attributes) {
      if (attr.name === "...attributes") {
        splatted = dynamic = true;
      } else if (attr.value.type === "TextNode" && !splatted) {
        out += attr.value.chars === "" ? ` ${attr.name}` : ` ${attr.name}="${escapeAttr(attr.value.chars)}"`;
      } else {
        dynamic = true;
      }
    }
    out += ">";
    if (dynamic) ops.push({ kind: "element", path, node });
    if (VOID_ELEMENTS.has(tag)) return out;
    let children = this.html(node.children, path, ops, body);
    if ((tag === "pre" || tag === "textarea" || tag === "listing") && children.startsWith("\n")) {
      children = `
${children}`;
    }
    return `${out}${children}</${tag}>`;
  }
  isComponent(node, scope) {
    let { head, tail } = node.path;
    if (head.type !== "VarHead") return true;
    if (tail.length > 0) return true;
    if (scope.lookup(head.name) !== void 0) return true;
    if (this.options.isLexical(head.name)) return true;
    return /^[A-Z]/u.test(head.name);
  }
  /////////////////////////////////////////////////////////////////////////
  // Elements
  /////////////////////////////////////////////////////////////////////////
  elementOps(node, element, body) {
    let splatted = false;
    for (let attr of node.attributes) {
      if (attr.name === "...attributes") {
        splatted = true;
        body.lines.push(`${this.rt("splat")}($_b, ${element}, $_ctx);`);
      } else if (attr.value.type === "TextNode") {
        if (splatted) {
          body.lines.push(
            `${this.rt("attr")}($_b, ${element}, ${q(attr.name)}, ${q(attr.value.chars)});`
          );
        }
      } else {
        body.lines.push(
          `${this.rt("attr")}($_b, ${element}, ${q(attr.name)}, () => ${this.attrValue(attr.value, body)});`
        );
      }
    }
    for (let modifier of node.modifiers) {
      this.modifier(modifier, element, body);
    }
  }
  attrValue(value, body) {
    switch (value.type) {
      case "TextNode":
        return q(value.chars);
      case "MustacheStatement":
        return this.mustacheValue(value, body);
      case "ConcatStatement":
        return `(${[
          '""',
          ...value.parts.map(
            (part) => part.type === "TextNode" ? q(part.chars) : `${this.rt("str")}(${this.mustacheValue(part, body)})`
          )
        ].join(" + ")})`;
    }
  }
  modifier(node, element, body) {
    let builtin = this.builtin(node.path, body.scope);
    if (builtin === "on") {
      let [event, handler] = node.params;
      if (!event || !handler) {
        throw new CodegenError("`on` requires an event name and a handler", node);
      }
      let options = node.hash.pairs.length ? `, { ${node.hash.pairs.map((p) => `${key(p.key)}: ${this.expr(p.value, body)}`).join(", ")} }` : "";
      body.lines.push(
        `${this.rt("listen")}($_b, ${element}, ${this.expr(event, body)}, () => ${this.expr(handler, body)}${options});`
      );
      return;
    }
    if (builtin !== null) {
      throw new CodegenError(`\`${builtin}\` cannot be used as a modifier`, node);
    }
    body.lines.push(
      `${this.rt("modifier")}($_b, ${element}, ${this.expr(node.path, body)}, ${this.positional(
        node.params,
        body
      )}, ${this.named(node.hash, body)});`
    );
  }
  /////////////////////////////////////////////////////////////////////////
  // Dynamic content
  /////////////////////////////////////////////////////////////////////////
  slot(node, anchor, body) {
    switch (node.type) {
      case "ElementNode": {
        this.componentElement(node, anchor, body);
        return;
      }
      case "MustacheStatement": {
        this.append(node, anchor, body);
        return;
      }
      case "BlockStatement": {
        this.block(node, anchor, body);
        return;
      }
    }
  }
  append(node, anchor, body) {
    let { path, params, hash } = node;
    let flags = node.trusting ? 2 : 0;
    if (path.type !== "PathExpression") {
      body.lines.push(
        `${this.rt("content")}($_b, ${anchor}, () => ${this.mustacheValue(node, body)}, ${flags});`
      );
      return;
    }
    let builtin = this.builtin(path, body.scope);
    switch (builtin) {
      case "yield": {
        let to = hash.pairs.find((p) => p.key === "to");
        let name = to ? this.staticString(to.value, "yield to=") : "default";
        body.lines.push(
          `${this.rt("yieldTo")}($_b, ${anchor}, $_ctx, ${q(name === "inverse" ? "else" : name)}, [${params.map((p) => `() => ${this.expr(p, body)}`).join(", ")}]);`
        );
        return;
      }
      case "debugger":
        body.lines.push("debugger;");
        return;
      case "component": {
        let [definition, ...rest] = params;
        if (!definition) throw new CodegenError("`{{component}}` requires a component", node);
        if (rest.length)
          throw new CodegenError("positional arguments to components are not supported yet", node);
        body.lines.push(
          `${this.rt("invokeDyn")}($_b, ${anchor}, () => ${this.expr(definition, body)}, ${this.named(hash, body) ?? "{}"}, null, null);`
        );
        return;
      }
    }
    if (builtin === null && (params.length > 0 || hash.pairs.length > 0)) {
      let isStatic = path.head.type === "VarHead" && path.tail.length === 0 && body.scope.lookup(path.head.name) === void 0;
      let definition = this.expr(path, body);
      body.lines.push(
        `${this.rt("appendCall")}($_b, ${anchor}, ${isStatic ? definition : `() => ${definition}`}, ${isStatic}, ${this.positional(
          params,
          body
        )}, ${this.named(hash, body)}, ${flags});`
      );
      return;
    }
    if (params.length === 0 && hash.pairs.length === 0 && builtin === null) {
      if (path.head.type === "VarHead" && path.tail.length === 0 && body.scope.lookup(path.head.name) === void 0) {
        flags |= 1;
      }
    }
    body.lines.push(
      `${this.rt("content")}($_b, ${anchor}, () => ${this.mustacheValue(node, body)}, ${flags});`
    );
  }
  /**
   * The value of `{{path params hash}}`.
   */
  mustacheValue(node, body) {
    if (node.params.length === 0 && node.hash.pairs.length === 0) {
      if (node.path.type === "PathExpression" && this.builtin(node.path, body.scope) === null) {
        return this.expr(node.path, body);
      }
      if (node.path.type !== "PathExpression" && node.path.type !== "SubExpression") {
        return this.expr(node.path, body);
      }
    }
    return this.call(node.path, node.params, node.hash, node, body);
  }
  block(node, anchor, body) {
    let { path, params, hash, program, inverse } = node;
    let builtin = path.type === "PathExpression" ? this.builtin(path, body.scope) : null;
    let { scope } = body;
    switch (builtin) {
      case "if":
      case "unless": {
        let [condition] = params;
        if (!condition) throw new CodegenError(`\`${builtin}\` requires a condition`, node);
        let test = `${this.rt("bool")}(${this.expr(condition, body)})`;
        body.lines.push(
          `${this.rt("when")}($_b, ${anchor}, () => ${builtin === "unless" ? `!${test}` : test}, ${this.blockFn(
            program,
            scope
          )}, ${this.blockFn(inverse, scope)});`
        );
        return;
      }
      case "each": {
        let [list] = params;
        if (!list) throw new CodegenError("`each` requires a list", node);
        let keyPair = hash.pairs.find((p) => p.key === "key");
        body.lines.push(
          `${this.rt("each")}($_b, ${anchor}, () => ${this.expr(list, body)}, ${keyPair ? this.expr(keyPair.value, body) : "null"}, ${this.blockFn(program, scope)}, ${this.blockFn(inverse, scope)});`
        );
        return;
      }
      case "each-in": {
        let [object] = params;
        if (!object) throw new CodegenError("`each-in` requires an object", node);
        let item = this.blockFnWith(program.body, ["entry"], scope, (id, _i, inner) => {
          let [k, v] = program.blockParams;
          if (k) inner.bind(k, `${id}()[0]`);
          if (v) inner.bind(v, `${id}()[1]`);
        });
        body.lines.push(
          `${this.rt("each")}($_b, ${anchor}, () => ${this.rt("entries")}(${this.expr(
            object,
            body
          )}), "0", ${item}, ${this.blockFn(inverse, scope)});`
        );
        return;
      }
      case "let": {
        let inner = scope.child();
        program.blockParams.forEach((name, i) => {
          let value = params[i];
          let id = this.uid("l");
          body.lines.push(
            `const ${id} = ${this.rt("memo")}(() => ${value ? this.expr(value, body) : "undefined"});`
          );
          inner.bind(name, `${id}()`);
        });
        body.lines.push(
          `${this.rt("scope")}($_b, ${anchor}, ($_b) => {
${this.body(program.body, inner)}
});`
        );
        return;
      }
      case "in-element": {
        let [destination] = params;
        if (!destination) throw new CodegenError("`in-element` requires a destination", node);
        let append = hash.pairs.some((p) => p.key === "insertBefore");
        body.lines.push(
          `${this.rt("inElement")}($_b, () => ${this.expr(destination, body)}, ${append}, ${this.blockFn(
            program,
            scope
          )});`
        );
        return;
      }
      case "component": {
        let [definition] = params;
        if (!definition) throw new CodegenError("`{{#component}}` requires a component", node);
        body.lines.push(
          `${this.rt("invokeDyn")}($_b, ${anchor}, () => ${this.expr(definition, body)}, ${this.named(hash, body) ?? "{}"}, ${this.blocksObject(program, inverse, scope)}, null);`
        );
        return;
      }
      case null:
        break;
      default:
        throw new CodegenError(
          `\`{{#${builtin}}}\` is not supported by the codegen compiler yet`,
          node
        );
    }
    if (params.length > 0) {
      throw new CodegenError("positional arguments to components are not supported yet", node);
    }
    this.invocation(
      path,
      anchor,
      this.named(hash, body) ?? "{}",
      this.blocksObject(program, inverse, scope),
      "null",
      body
    );
  }
  blocksObject(program, inverse, scope) {
    let entries = [`default: ${this.blockFn(program, scope)}`];
    if (inverse) entries.push(`else: ${this.blockFn(inverse, scope)}`);
    return `{ ${entries.join(", ")} }`;
  }
  componentElement(node, anchor, body) {
    let named = [];
    let attrs = [];
    for (let attr of node.attributes) {
      if (attr.name.startsWith("@")) {
        named.push(`${key(attr.name.slice(1))}: () => ${this.attrValue(attr.value, body)}`);
      } else {
        attrs.push(attr);
      }
    }
    let attrsFn = "null";
    if (attrs.length > 0 || node.modifiers.length > 0) {
      let inner = { lines: [], scope: body.scope };
      for (let attr of attrs) {
        if (attr.name === "...attributes") {
          inner.lines.push(`${this.rt("splat")}($_b, $_el, $_ctx);`);
        } else {
          let value = attr.value.type === "TextNode" ? q(attr.value.chars) : `() => ${this.attrValue(attr.value, inner)}`;
          inner.lines.push(`${this.rt("attr")}($_b, $_el, ${q(attr.name)}, ${value});`);
        }
      }
      for (let modifier of node.modifiers) {
        this.modifier(modifier, "$_el", inner);
      }
      attrsFn = `($_b, $_el) => {
${inner.lines.join("\n")}
}`;
    }
    let blocks = "null";
    let namedBlocks = node.children.filter(
      (c) => c.type === "ElementNode" && c.tag.startsWith(":")
    );
    if (namedBlocks.length > 0) {
      blocks = `{ ${namedBlocks.map(
        (b) => `${key(b.tag.slice(1))}: ${this.blockFnWith(
          b.children,
          b.params.map((p) => p.name),
          body.scope
        )}`
      ).join(", ")} }`;
    } else if (node.children.length > 0) {
      blocks = `{ default: ${this.blockFnWith(
        node.children,
        node.params.map((p) => p.name),
        body.scope
      )} }`;
    }
    this.invocation(node.path, anchor, `{ ${named.join(", ")} }`, blocks, attrsFn, body);
  }
  invocation(path, anchor, named, blocks, attrs, body) {
    let { head, tail } = path;
    let isStatic = head.type === "VarHead" && tail.length === 0 && body.scope.lookup(head.name) === void 0 && this.options.isLexical(head.name);
    if (isStatic) {
      body.lines.push(
        `${this.rt("invoke")}($_b, ${anchor}, ${this.expr(path, body)}, ${named}, ${blocks}, ${attrs});`
      );
    } else {
      body.lines.push(
        `${this.rt("invokeDyn")}($_b, ${anchor}, () => ${this.expr(path, body)}, ${named}, ${blocks}, ${attrs});`
      );
    }
  }
  /////////////////////////////////////////////////////////////////////////
  // Expressions
  /////////////////////////////////////////////////////////////////////////
  /**
   * Which built-in (keyword, or well-known import) does `path` refer to?
   */
  builtin(path, scope) {
    if (path.type !== "PathExpression") return null;
    let { head, tail } = path;
    if (head.type !== "VarHead" || tail.length > 0) return null;
    let { name } = head;
    if (scope.lookup(name) !== void 0) return null;
    if (KEYWORDS.has(name)) return name;
    if (this.options.isLexical(name)) {
      let info = this.options.importOf?.(name);
      if (info && SPECIALIZED[info.module]?.has(info.name)) return info.name;
      return null;
    }
    return name in AUTO_IMPORTED ? name : null;
  }
  expr(node, body) {
    switch (node.type) {
      case "StringLiteral":
        return q(node.value);
      case "NumberLiteral":
        return String(node.value);
      case "BooleanLiteral":
        return String(node.value);
      case "NullLiteral":
        return "null";
      case "UndefinedLiteral":
        return "undefined";
      case "SubExpression":
        return this.call(node.path, node.params, node.hash, node, body);
      case "PathExpression":
        return this.path(node, body);
    }
  }
  path(node, body) {
    let { head, tail } = node;
    let base;
    switch (head.type) {
      case "ThisHead":
        base = "$_s";
        break;
      case "AtHead":
        base = `$_a${prop(head.name.replace(/^@/u, ""))}`;
        break;
      case "VarHead": {
        let local = body.scope.lookup(head.name);
        if (local !== void 0) {
          base = local;
        } else if (this.options.isLexical(head.name)) {
          base = head.name;
        } else if (head.name in AUTO_IMPORTED) {
          base = this.options.importBinding(AUTO_IMPORTED[head.name], head.name);
        } else {
          throw new CodegenError(
            `Attempted to use \`${head.name}\`, but it is not in scope. In strict mode, values must be imported or defined in JavaScript`,
            node
          );
        }
        break;
      }
    }
    return tail.length > 0 ? `${this.rt("get")}(${[base, ...tail.map(q)].join(", ")})` : base;
  }
  positional(params, body) {
    if (params.length === 0) return "null";
    return `[${params.map((p) => `() => ${this.expr(p, body)}`).join(", ")}]`;
  }
  named(hash, body) {
    if (hash.pairs.length === 0) return null;
    return `{ ${hash.pairs.map((p) => `${key(p.key)}: () => ${this.expr(p.value, body)}`).join(", ")} }`;
  }
  staticString(node, what) {
    if (node.type !== "StringLiteral")
      throw new CodegenError(`${what} must be a string literal`, node);
    return node.value;
  }
  /**
   * `(path params hash)` (or `{{path params hash}}`).
   */
  call(path, params, hash, node, body) {
    let builtin = this.builtin(path, body.scope);
    let arg = (i) => {
      let param = params[i];
      return param ? this.expr(param, body) : "undefined";
    };
    let all = () => params.map((p) => this.expr(p, body));
    switch (builtin) {
      case null:
        break;
      case "if":
        return `(${this.rt("bool")}(${arg(0)}) ? ${arg(1)} : ${arg(2)})`;
      case "unless":
        return `(${this.rt("bool")}(${arg(0)}) ? ${arg(2)} : ${arg(1)})`;
      case "concat":
        return `(${['""', ...all().map((p) => `${this.rt("str")}(${p})`)].join(" + ")})`;
      case "fn":
        return `((...$_r) => (${arg(0)})(${[...all().slice(1), "...$_r"].join(", ")}))`;
      case "hash":
        return `({ ${hash.pairs.map((p) => `get ${key(p.key)}() { return ${this.expr(p.value, body)}; }`).join(", ")} })`;
      case "array":
        return `[${all().join(", ")}]`;
      case "get":
        return `${this.rt("getPath")}(${arg(0)}, ${arg(1)})`;
      case "eq":
      case "neq":
      case "gt":
      case "gte":
      case "lt":
      case "lte":
        return `(${arg(0)} ${COMPARISONS[builtin]} ${arg(1)})`;
      case "not":
        return `!${this.rt("bool")}(${arg(0)})`;
      case "and":
      case "or":
        return `${this.rt(builtin)}(${all().map((p) => `() => ${p}`).join(", ")})`;
      case "has-block":
      case "has-block-params":
        return `${this.rt(builtin === "has-block" ? "hasBlock" : "hasBlockParams")}($_ctx${params.length ? `, ${arg(0)}` : ""})`;
      case "component":
        return `${this.rt("curry")}(${arg(0)}, ${this.named(hash, body) ?? "null"})`;
      case "log":
        return `${this.rt("log")}(${all().join(", ")})`;
      case "element":
        break;
      default:
        throw new CodegenError(`\`${builtin}\` is not supported by the codegen compiler yet`, node);
    }
    let positional = this.positional(params, body);
    let named = this.named(hash, body);
    let id = this.uid("h");
    let isStatic = path.type === "PathExpression" && path.head.type === "VarHead" && path.tail.length === 0 && body.scope.lookup(path.head.name) === void 0;
    if (isStatic) {
      body.lines.push(
        `const ${id} = ${this.rt("helper")}($_b, ${this.expr(path, body)}, ${positional}, ${named});`
      );
    } else {
      body.lines.push(
        `const ${id} = ${this.rt("helperDyn")}($_b, () => ${this.expr(path, body)}, ${positional}, ${named});`
      );
    }
    return `${id}()`;
  }
};
function staticText(node) {
  if (node.trusting || node.params.length > 0 || node.hash.pairs.length > 0) return null;
  let { path } = node;
  switch (path.type) {
    case "StringLiteral":
      return path.value;
    case "NumberLiteral":
    case "BooleanLiteral":
      return String(path.value);
    case "NullLiteral":
    case "UndefinedLiteral":
      return "";
    default:
      return null;
  }
}
function generate(ast, options) {
  let generator = new Generator(options);
  let expression = generator.template(ast);
  return { hoisted: generator.hoisted, expression };
}

// packages/@glimmer/compiler/lib/codegen/babel-plugin.ts
var TEMPLATE_MODULES = /* @__PURE__ */ new Set(["@ember/template-compiler", "@ember/template-compiler/runtime"]);
function importedName(specifier) {
  return specifier.imported.type === "StringLiteral" ? specifier.imported.value : specifier.imported.name;
}
function codegenBabelPlugin(babel, options) {
  let t = babel.types;
  let runtimeModule = options.runtimeModule ?? "@glimmer/dom";
  return {
    name: "glimmer-codegen",
    visitor: {
      Program: {
        enter(_path, state) {
          state.codegen = { imports: /* @__PURE__ */ new Map(), hoisted: [], templates: 0 };
        },
        exit(path, state) {
          let { imports, hoisted } = state.codegen;
          if (imports.size === 0) return;
          let declarations = [...imports].map(
            ([module, names]) => t.importDeclaration(
              [...names].map(
                ([name, local]) => t.importSpecifier(t.identifier(local), t.identifier(name))
              ),
              t.stringLiteral(module)
            )
          );
          let statements = hoisted.flatMap(
            (code) => babel.template.statements.ast(code, { placeholderPattern: false })
          );
          path.unshiftContainer("body", [...declarations, ...statements]);
          path.scope.crawl();
          for (let statement of path.get("body")) {
            if (!statement.isImportDeclaration()) continue;
            if (!TEMPLATE_MODULES.has(statement.node.source.value)) continue;
            for (let specifier of statement.get("specifiers")) {
              let binding = path.scope.getBinding(specifier.node.local.name);
              if (binding && !binding.referenced) specifier.remove();
            }
            if (statement.node.specifiers.length === 0) statement.remove();
          }
        }
      },
      CallExpression(path, state) {
        let callee = path.get("callee");
        if (!callee.isIdentifier()) return;
        let binding = path.scope.getBinding(callee.node.name);
        if (!binding || binding.kind !== "module" || !binding.path.isImportSpecifier()) return;
        if (!TEMPLATE_MODULES.has(binding.path.parent.source.value)) return;
        if (importedName(binding.path.node) !== "template") return;
        let [source, templateOptions] = path.node.arguments;
        let text;
        if (t.isTemplateLiteral(source) && source.expressions.length === 0) {
          text = source.quasis[0].value.cooked;
        } else if (t.isStringLiteral(source)) {
          text = source.value;
        } else {
          throw path.buildCodeFrameError("template() must be called with a static string");
        }
        let component = null;
        if (templateOptions && t.isObjectExpression(templateOptions)) {
          for (let property of templateOptions.properties) {
            if (t.isObjectProperty(property) && t.isIdentifier(property.key, { name: "component" })) {
              component = property.value;
            }
          }
        }
        let program = path.scope.getProgramParent();
        let { imports } = state.codegen;
        let local = (module, name) => {
          let names = imports.get(module);
          if (!names) imports.set(module, names = /* @__PURE__ */ new Map());
          let existing = names.get(name);
          if (existing) return existing;
          let id = program.generateUid(name.replace(/\W/gu, "_"));
          names.set(name, id);
          return id;
        };
        let importOf = (name) => {
          let found = path.scope.getBinding(name);
          if (!found || found.kind !== "module") return void 0;
          let module = found.path.parent.source.value;
          if (found.path.isImportSpecifier())
            return { module, name: importedName(found.path.node) };
          if (found.path.isImportDefaultSpecifier()) return { module, name: "default" };
          return void 0;
        };
        let ast = options.preprocess(text, { strictMode: true });
        let { hoisted, expression } = generate(ast, {
          isLexical: (name) => Boolean(path.scope.getBinding(name)),
          importOf,
          runtime: (name) => local(runtimeModule, name),
          importBinding: local,
          prefix: `${state.codegen.templates++}_`
        });
        state.codegen.hoisted.push(...hoisted);
        let replacement = babel.template.expression.ast(expression, { placeholderPattern: false });
        if (component) {
          replacement = t.callExpression(t.identifier(local(runtimeModule, "setTemplate")), [
            component,
            replacement
          ]);
        }
        path.replaceWith(replacement);
      }
    }
  };
}
export {
  CodegenError,
  codegenBabelPlugin,
  generate
};
