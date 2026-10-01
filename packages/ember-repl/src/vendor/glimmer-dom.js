// @ts-nocheck
/* eslint-disable */
/**
 * VENDORED -- do not edit.
 *
 * The runtime for compiled templates (`@glimmer/dom`).
 * Built from https://github.com/NullVoxPopuli-ai-agent/ember.js/tree/claude/gallant-heisenberg-aovzyr (2b03eb8).
 *
 * This is an experiment: strict-mode templates compiled directly to DOM
 * operations, with no wire format and no VM.
 */

// packages/@glimmer/dom/lib/core.ts
import { associateDestroyableChild, destroy } from "@glimmer/destroyable";
var Root = class {
  constructor(owner, document) {
    this.owner = owner;
    this.document = document;
  }
  owner;
  document;
  #queue = [];
  /**
   * Schedule work that must happen after DOM is inserted
   * (modifier install/update, component didCreate hooks).
   */
  schedule(fn) {
    this.#queue.push(fn);
  }
  flush() {
    while (this.#queue.length > 0) {
      let queue = this.#queue;
      this.#queue = [];
      for (let fn of queue) fn();
    }
  }
};
var Block = class {
  constructor(root, parent) {
    this.root = root;
    if (parent) associateDestroyableChild(parent, this);
  }
  root;
  updaters = [];
  update() {
    let { updaters } = this;
    for (let i = 0; i < updaters.length; i++) {
      updaters[i]();
    }
  }
};
function marker(root) {
  return root.document.createTextNode("");
}
function mount(parent, before, render2) {
  let b = new Block(parent.root, parent);
  let start = marker(parent.root);
  let end = marker(parent.root);
  let target = before.parentNode;
  target.insertBefore(start, before);
  target.insertBefore(render2(b), before);
  target.insertBefore(end, before);
  return { b, start, end };
}
function unmount(m) {
  removeRange(m.start, m.end);
  destroy(m.b);
}
function removeRange(first, last) {
  let parent = first.parentNode;
  if (!parent) return;
  let node = first;
  while (node) {
    let next = node === last ? null : node.nextSibling;
    parent.removeChild(node);
    node = next;
  }
}
function moveRange(m, before) {
  let parent = before.parentNode;
  let node = m.start;
  while (node) {
    let next = node === m.end ? null : node.nextSibling;
    parent.insertBefore(node, before);
    node = next;
  }
}
function html(markup) {
  return { markup, parsed: null };
}
function clone(b, t) {
  let parsed = t.parsed;
  if (parsed === null) {
    parsed = t.parsed = b.root.document.createElement("template");
    parsed.innerHTML = t.markup;
  }
  return b.root.document.importNode(parsed.content, true);
}
function at(node, ...path) {
  for (let i of path) {
    node = node.childNodes[i];
  }
  return node;
}
var Template = class {
  constructor(render2) {
    this.render = render2;
  }
  render;
  toString() {
    return "(compiled template)";
  }
};
function template(render2) {
  return new Template(render2);
}
var TEMPLATES = /* @__PURE__ */ new WeakMap();
function setTemplate(definition, t) {
  TEMPLATES.set(definition, t);
  return definition;
}
function templateFor(definition) {
  if (definition instanceof Template) return definition;
  let pointer = definition;
  while (pointer !== null && pointer !== Function.prototype && pointer !== Object.prototype) {
    let found = TEMPLATES.get(pointer);
    if (found) return found;
    pointer = Object.getPrototypeOf(pointer);
  }
  return void 0;
}

// packages/@glimmer/dom/lib/attributes.ts
import { registerDestructor } from "@glimmer/destroyable";

// shim:@glimmer/validator/lib/tracking
import { consumeTag, createCache, getValue, isConst, track } from "@glimmer/validator";

// packages/@glimmer/dom/lib/attributes.ts
var XHTML = "http://www.w3.org/1999/xhtml";
var PROPERTIES = /* @__PURE__ */ new Set(["value", "checked", "selected", "indeterminate", "muted"]);
var SANITIZED_TAGS = /* @__PURE__ */ new Set(["A", "BODY", "LINK", "IMG", "IFRAME", "BASE", "FORM"]);
var SANITIZED_ATTRS = /* @__PURE__ */ new Set(["href", "src", "background", "action"]);
var BAD_PROTOCOLS = /* @__PURE__ */ new Set(["javascript:", "vbscript:"]);
function normalizeAttrValue(value) {
  if (value === false || value === void 0 || value === null) return null;
  if (value === true) return "";
  if (typeof value === "function") return null;
  if (typeof value.toString !== "function") return null;
  return String(value);
}
function sanitize(element, name, value) {
  if (value === null || !SANITIZED_TAGS.has(element.tagName) || !SANITIZED_ATTRS.has(name)) {
    return value;
  }
  let protocol;
  try {
    protocol = new URL(value, "http://localhost").protocol;
  } catch {
    return value;
  }
  return BAD_PROTOCOLS.has(protocol) ? `unsafe:${value}` : value;
}
function setterFor(element, name) {
  if (element.namespaceURI === XHTML && PROPERTIES.has(name) && name in element) {
    return (value) => {
      element[name] = value === null || value === void 0 ? name === "value" ? "" : false : value;
    };
  }
  return (value) => {
    let normalized = sanitize(element, name, normalizeAttrValue(value));
    if (normalized === null) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, normalized);
    }
  };
}
function bind(b, value, setter) {
  if (typeof value !== "function") {
    setter(value);
    return;
  }
  let cache = createCache(value);
  let current = getValue(cache);
  setter(current);
  if (isConst(cache)) return;
  b.updaters.push(() => {
    let next = getValue(cache);
    if (next !== current) {
      current = next;
      setter(next);
    }
  });
}
var CLASSES = /* @__PURE__ */ new WeakMap();
function classPart(b, element, value) {
  let state = CLASSES.get(element);
  if (!state) {
    state = { parts: [] };
    let existing = element.getAttribute("class");
    if (existing) state.parts.push(existing);
    CLASSES.set(element, state);
  }
  let { parts } = state;
  let index = parts.length;
  parts.push("");
  bind(b, value, (next) => {
    parts[index] = normalizeAttrValue(next) ?? "";
    let className = parts.filter(Boolean).join(" ");
    if (className) {
      element.setAttribute("class", className);
    } else {
      element.removeAttribute("class");
    }
  });
}
function attr(b, element, name, value) {
  if (name === "class") {
    classPart(b, element, value);
  } else {
    bind(b, value, setterFor(element, name));
  }
}
function splat(b, element, ctx) {
  ctx.attrs?.(b, element);
}
function listen(b, element, eventName, handler, options) {
  let cache = createCache(handler);
  let listener = (event) => {
    let fn = getValue(cache);
    if (typeof fn === "function") {
      return fn(event);
    }
    throw new Error(
      `You must pass a function as the second argument to the \`on\` modifier; you passed ${String(fn)}.`
    );
  };
  element.addEventListener(eventName, listener, options);
  registerDestructor(b, () => {
    element.removeEventListener(eventName, listener, options);
  });
}

// shim:@glimmer/manager/lib/internal/api
import { getInternalComponentManager, getInternalHelperManager, getInternalModifierManager } from "@glimmer/manager";

// packages/@glimmer/dom/lib/invoke.ts
import { associateDestroyableChild as associateDestroyableChild3, registerDestructor as registerDestructor2 } from "@glimmer/destroyable";

// shim:@glimmer/reference/lib/reference
import { createComputeRef, valueForRef } from "@glimmer/reference";

// packages/@glimmer/dom/lib/managers.ts
import { associateDestroyableChild as associateDestroyableChild2, destroy as destroy2 } from "@glimmer/destroyable";

// shim:@glimmer/validator/lib/validators
import { createTag, dirtyTag, updateTag, validateTag, valueForTag } from "@glimmer/validator";

// packages/@glimmer/dom/lib/managers.ts
function capture(named, positional) {
  let capturedNamed = /* @__PURE__ */ Object.create(null);
  if (named) {
    for (let key of Object.keys(named)) {
      capturedNamed[key] = createComputeRef(named[key]);
    }
  }
  let capturedPositional = (positional ?? []).map((thunk) => createComputeRef(thunk));
  return {
    named: capturedNamed,
    positional: capturedPositional
  };
}
function resolveHelper(definition) {
  let manager = getInternalHelperManager(definition);
  return typeof manager === "function" ? manager : manager.getHelper(definition);
}
function instantiateHelper(b, definition, args) {
  let ref = resolveHelper(definition)(args, b.root.owner);
  associateDestroyableChild2(b, ref);
  return ref;
}
function helper(b, definition, positional, named) {
  let ref = instantiateHelper(b, definition, capture(named, positional));
  return () => valueForRef(ref);
}
function helperDyn(b, definition, positional, named) {
  let args = capture(named, positional);
  let definitionCache = createCache(definition);
  let current;
  let ref = null;
  return () => {
    let next = getValue(definitionCache);
    if (next !== current || ref === null) {
      if (ref !== null) destroy2(ref);
      current = next;
      ref = instantiateHelper(b, next, args);
    }
    return valueForRef(ref);
  };
}
function modifier(b, element, definition, positional, named) {
  let manager = getInternalModifierManager(definition);
  let state = manager.create(
    b.root.owner,
    element,
    definition,
    capture(named, positional)
  );
  let destroyable = manager.getDestroyable(state);
  if (destroyable) associateDestroyableChild2(b, destroyable);
  let tag = manager.getTag(state);
  if (tag === null) {
    b.root.schedule(() => {
      manager.install(state);
    });
    return;
  }
  let lastRevision = null;
  let run = (hook) => {
    updateTag(
      tag,
      track(() => {
        hook(state);
      })
    );
    consumeTag(tag);
    lastRevision = valueForTag(tag);
  };
  b.root.schedule(() => {
    run((s) => {
      manager.install(s);
    });
  });
  b.updaters.push(() => {
    consumeTag(tag);
    if (lastRevision === null || validateTag(tag, lastRevision)) return;
    lastRevision = null;
    b.root.schedule(() => {
      run((s) => {
        manager.update(s);
      });
    });
  });
}

// packages/@glimmer/dom/lib/invoke.ts
var Curried = class {
  constructor(definition, named) {
    this.definition = definition;
    this.named = named;
  }
  definition;
  named;
};
function curry(definition, named) {
  if (!definition) return null;
  return new Curried(definition, named ?? {});
}
function isComponentDefinition(value) {
  if (value instanceof Template || value instanceof Curried) return true;
  if (typeof value !== "object" && typeof value !== "function" || value === null) return false;
  if (templateFor(value)) return true;
  return getInternalComponentManager(value, true) !== null;
}
var vmFallback = null;
function setVMFallback(fallback) {
  vmFallback = fallback;
}
function describe(definition) {
  return typeof definition === "function" ? definition.name || "(anonymous component)" : Object.prototype.toString.call(definition);
}
function argsFor(captured) {
  let args = /* @__PURE__ */ Object.create(null);
  for (let key of Object.keys(captured.named)) {
    let ref = captured.named[key];
    Object.defineProperty(args, key, { enumerable: true, get: () => valueForRef(ref) });
  }
  return args;
}
function island(b, definition, named) {
  if (!vmFallback) {
    throw new Error(
      `${describe(definition)} does not have a compiled template, and there is no VM fallback registered to render it.`
    );
  }
  let args = /* @__PURE__ */ Object.create(null);
  for (let key of Object.keys(named)) {
    Object.defineProperty(args, key, { enumerable: true, get: named[key] });
  }
  let element = b.root.document.createElement("glimmer-island");
  element.style.display = "contents";
  let result = vmFallback(definition, element, b.root.owner, args);
  registerDestructor2(b, () => {
    result.destroy();
  });
  return element;
}
function instantiate(b, definition, named, blocks, attrs) {
  while (definition instanceof Curried) {
    named = { ...definition.named, ...named };
    definition = definition.definition;
  }
  let compiled = templateFor(definition);
  if (!compiled) return island(b, definition, named);
  let captured = capture(named, null);
  let args = argsFor(captured);
  if (compiled === definition) {
    return compiled.render(b, { self: void 0, args, blocks, attrs });
  }
  let manager = getInternalComponentManager(definition);
  if (!("getDelegateFor" in manager)) {
    throw new Error(
      `Compiled templates can only be used with components that have a custom component manager (like @glimmer/component). ${describe(definition)} does not.`
    );
  }
  let state = manager.create(b.root.owner, definition, { capture: () => captured });
  let self = valueForRef(manager.getSelf(state));
  let destroyable = manager.getDestroyable(state);
  if (destroyable) associateDestroyableChild3(b, destroyable);
  b.root.schedule(() => {
    manager.didCreate(state);
  });
  return compiled.render(b, { self, args, blocks, attrs });
}
function invoke(b, anchor, definition, named, blocks, attrs) {
  let m = mount(b, anchor, (child) => instantiate(child, definition, named, blocks, attrs));
  b.updaters.push(() => {
    m.b.update();
  });
}
function invokeDyn(b, anchor, definition, named, blocks, attrs) {
  let cache = createCache(definition);
  let current = getValue(cache);
  let render2 = (value) => value ? mount(b, anchor, (child) => instantiate(child, value, named, blocks, attrs)) : null;
  let m = render2(current);
  b.updaters.push(() => {
    let next = getValue(cache);
    if (next === current) {
      m?.b.update();
      return;
    }
    if (m) unmount(m);
    current = next;
    m = render2(next);
  });
}

// packages/@glimmer/dom/lib/values.ts
import { getPath as globalGetPath, getProp, toBool } from "@glimmer/global-context";
function get(obj, ...keys) {
  for (let key of keys) {
    if (obj === null || obj === void 0) return void 0;
    obj = getProp(obj, key);
  }
  return obj;
}
function getPath(obj, path) {
  if (obj === null || obj === void 0 || path === null || path === void 0) return void 0;
  return globalGetPath(obj, String(path));
}
function bool(value) {
  return toBool(value);
}
function isEmpty(value) {
  return value === null || value === void 0 || typeof value.toString !== "function";
}
function str(value) {
  return isEmpty(value) ? "" : String(value);
}
function and(...values) {
  let last;
  for (let value of values) {
    last = value();
    if (!toBool(last)) return last;
  }
  return last;
}
function or(...values) {
  let last;
  for (let value of values) {
    last = value();
    if (toBool(last)) return last;
  }
  return last;
}
function memo(fn) {
  let cache = createCache(fn);
  return () => getValue(cache);
}
function log(...values) {
  console.log(...values);
  return void 0;
}
function entries(obj) {
  if (obj === null || obj === void 0) return [];
  if (obj instanceof Map) return Array.from(obj.entries());
  return Object.keys(obj).map((key) => [key, get(obj, key)]);
}
function hasBlock(ctx, name = "default") {
  return Boolean(ctx.blocks?.[name]);
}
function hasBlockParams(ctx, name = "default") {
  let block2 = ctx.blocks?.[name];
  return block2 ? block2.length > 1 : false;
}

// packages/@glimmer/dom/lib/content.ts
var MAY_CALL = 1;
var TRUSTING = 2;
function isSafeString(value) {
  return typeof value === "object" && value !== null && typeof value.toHTML === "function";
}
function isNode(value) {
  return typeof value === "object" && value !== null && typeof value.nodeType === "number";
}
function kindOf(value, flags) {
  if (typeof value === "string") return flags & TRUSTING ? 1 /* html */ : 0 /* text */;
  if (value === null || value === void 0) return 0 /* text */;
  if (typeof value !== "object" && typeof value !== "function") return 0 /* text */;
  if (isSafeString(value)) return 1 /* html */;
  if (isNode(value)) return 2 /* node */;
  if (isComponentDefinition(value)) return 3 /* component */;
  return 0 /* text */;
}
function isHelperLike(value) {
  if (isComponentDefinition(value)) return false;
  if (typeof value === "function") return true;
  return typeof value === "object" && value !== null && getInternalHelperManager(value, true) !== null;
}
function insertNodes(parent, before, nodes) {
  let doc = parent.ownerDocument ?? parent;
  if (nodes.nodeType === 11) {
    if (!nodes.firstChild) nodes.appendChild(doc.createTextNode(""));
    let first = nodes.firstChild;
    let last = nodes.lastChild;
    parent.insertBefore(nodes, before);
    return { first, last, text: null, mounted: null };
  }
  parent.insertBefore(nodes, before);
  return { first: nodes, last: nodes, text: null, mounted: null };
}
function render(b, parent, before, kind, value, flags) {
  let doc = b.root.document;
  switch (kind) {
    case 0 /* text */: {
      let text = doc.createTextNode(str(value));
      parent.insertBefore(text, before);
      return { first: text, last: text, text, mounted: null };
    }
    case 1 /* html */: {
      let t = doc.createElement("template");
      t.innerHTML = flags & TRUSTING && !isSafeString(value) ? str(value) : value.toHTML();
      return insertNodes(parent, before, t.content);
    }
    case 2 /* node */:
      return insertNodes(parent, before, value);
    case 3 /* component */: {
      let mounted = mount(
        b,
        before,
        (child) => instantiate(child, value, {}, null, null)
      );
      return { first: mounted.start, last: mounted.end, text: null, mounted };
    }
  }
}
function clear(slot) {
  if (slot.mounted) {
    unmount(slot.mounted);
  } else {
    removeRange(slot.first, slot.last);
  }
}
function content(b, anchor, fn, flags = 0) {
  if (flags & MAY_CALL) {
    let definition = fn();
    if (isHelperLike(definition)) fn = helper(b, definition, null, null);
  }
  let cache = createCache(fn);
  let value = getValue(cache);
  let kind = kindOf(value, flags);
  let parent = anchor.parentNode;
  let slot = render(b, parent, anchor, kind, value, flags);
  parent.removeChild(anchor);
  if (isConst(cache) && kind !== 3 /* component */) return;
  b.updaters.push(() => {
    let next = getValue(cache);
    if (next === value) {
      slot.mounted?.b.update();
      return;
    }
    let nextKind = kindOf(next, flags);
    if (kind === 0 /* text */ && nextKind === 0 /* text */ && slot.text) {
      slot.text.data = str(next);
      value = next;
      return;
    }
    let nextSlot = render(b, slot.first.parentNode, slot.first, nextKind, next, flags);
    clear(slot);
    slot = nextSlot;
    kind = nextKind;
    value = next;
  });
}
function appendCall(b, anchor, definition, isStatic, positional, named, flags = 0) {
  let value = isStatic ? definition : definition();
  if (isComponentDefinition(value)) {
    if (positional) {
      throw new Error("positional arguments to components are not supported yet");
    }
    if (isStatic) {
      invoke(b, anchor, value, named ?? {}, null, null);
    } else {
      invokeDyn(b, anchor, definition, named ?? {}, null, null);
    }
    return;
  }
  let result = isStatic ? helper(b, value, positional, named) : helperDyn(b, definition, positional, named);
  content(b, anchor, result, flags);
}

// shim:@glimmer/reference/lib/iterable
import { createIteratorRef } from "@glimmer/reference";

// shim:@glimmer/validator/lib/meta
import { tagFor } from "@glimmer/validator";

// packages/@glimmer/dom/lib/control-flow.ts
function when(b, anchor, condition, consequent, alternate) {
  let cache = createCache(condition);
  let current = Boolean(getValue(cache));
  let render2 = (value) => {
    let fn = value ? consequent : alternate;
    return fn ? mount(b, anchor, fn) : null;
  };
  let m = render2(current);
  b.updaters.push(() => {
    let next = Boolean(getValue(cache));
    if (next === current) {
      m?.b.update();
      return;
    }
    if (m) unmount(m);
    current = next;
    m = render2(next);
  });
}
function cell(initial) {
  let tag = createTag();
  let value = initial;
  return {
    read: () => {
      consumeTag(tag);
      return value;
    },
    set(next) {
      if (next !== value) {
        value = next;
        dirtyTag(tag);
      }
    }
  };
}
function each(b, anchor, list, key, item, inverse) {
  let listRef = createComputeRef(() => {
    let value = list();
    if (typeof value === "object" && value !== null) consumeTag(tagFor(value, "[]"));
    return value;
  });
  let iteratorRef = createIteratorRef(listRef, key ?? "@identity");
  let rows = [];
  let byKey = /* @__PURE__ */ new Map();
  let inverseMounted = null;
  let lastIterator = null;
  let sync = () => {
    let iterator = valueForRef(iteratorRef);
    if (iterator === lastIterator) {
      for (let row of rows) row.m?.b.update();
      inverseMounted?.b.update();
      return;
    }
    lastIterator = iterator;
    let nextRows = [];
    let nextByKey = /* @__PURE__ */ new Map();
    for (let entry = iterator.next(); entry !== null; entry = iterator.next()) {
      let row = byKey.get(entry.key);
      if (row) {
        row.value.set(entry.value);
        row.index.set(entry.memo);
      } else {
        row = { value: cell(entry.value), index: cell(entry.memo), m: null };
      }
      nextByKey.set(entry.key, row);
      nextRows.push(row);
    }
    for (let [k, row] of byKey) {
      if (nextByKey.get(k) !== row && row.m) unmount(row.m);
    }
    let before = anchor;
    for (let i = nextRows.length - 1; i >= 0; i--) {
      let row = nextRows[i];
      if (row.m === null) {
        let { value, index } = row;
        row.m = mount(b, before, (child) => item(child, value.read, index.read));
      } else {
        if (row.m.end.nextSibling !== before) moveRange(row.m, before);
        row.m.b.update();
      }
      before = row.m.start;
    }
    rows = nextRows;
    byKey = nextByKey;
    if (rows.length === 0 && inverse && !inverseMounted) {
      inverseMounted = mount(b, anchor, inverse);
    } else if (rows.length > 0 && inverseMounted) {
      unmount(inverseMounted);
      inverseMounted = null;
    }
  };
  sync();
  b.updaters.push(sync);
}
function block(b, anchor, fn, params) {
  let m = mount(b, anchor, (child) => fn(child, ...params));
  b.updaters.push(() => {
    m.b.update();
  });
}
function yieldTo(b, anchor, ctx, name, params) {
  let fn = ctx.blocks?.[name] ?? (name === "else" ? ctx.blocks?.["inverse"] : void 0);
  if (fn) block(b, anchor, fn, params);
}
function scope(b, anchor, fn) {
  block(b, anchor, fn, []);
}
function inElement(b, destination, append, fn) {
  let cache = createCache(destination);
  let current = null;
  let m = null;
  let end = null;
  let render2 = (target) => {
    current = target;
    if (!target) return;
    if (!append) target.innerHTML = "";
    end = marker(b.root);
    target.appendChild(end);
    m = mount(b, end, fn);
  };
  render2(getValue(cache));
  b.updaters.push(() => {
    let next = getValue(cache);
    if (next === current) {
      m?.b.update();
      return;
    }
    if (m) unmount(m);
    if (end) removeRange(end, end);
    m = null;
    end = null;
    render2(next);
  });
}

// packages/@glimmer/dom/lib/render.ts
import { destroy as destroy3 } from "@glimmer/destroyable";

// shim:@ember/-internals/glimmer/lib/base-renderer
import { renderComponent } from "@ember/renderer";

// packages/@glimmer/dom/lib/render.ts
import { _backburner } from "@ember/runloop";
setVMFallback((definition, into, owner, args) => renderComponent(definition, { into, owner, args }));
function renderComponent2(component, {
  into,
  owner = {},
  args
}) {
  let root = new Root(owner, into.ownerDocument);
  let b = new Block(root, null);
  let named = {};
  if (args) {
    for (let key of Object.keys(args)) named[key] = () => args[key];
  }
  into.innerHTML = "";
  let end = marker(root);
  into.appendChild(end);
  let tag;
  let revision;
  let destroyed = false;
  let pass = (fn) => {
    tag = track(() => {
      fn();
      root.flush();
    });
    revision = valueForTag(tag);
  };
  pass(() => {
    let m = mount(b, end, (child) => instantiate(child, component, named, null, null));
    b.updaters.push(() => {
      m.b.update();
    });
  });
  let rerender = () => {
    if (destroyed || validateTag(tag, revision)) return;
    pass(() => {
      b.update();
    });
  };
  _backburner.on("end", rerender);
  return {
    rerender,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      _backburner.off("end", rerender);
      removeRange(into.firstChild, end);
      destroy3(b);
    }
  };
}
export {
  MAY_CALL,
  TRUSTING,
  Template,
  and,
  appendCall,
  at,
  attr,
  bool,
  clone,
  content,
  curry,
  each,
  entries,
  get,
  getPath,
  hasBlock,
  hasBlockParams,
  helper,
  helperDyn,
  html,
  inElement,
  invoke,
  invokeDyn,
  listen,
  log,
  memo,
  modifier,
  or,
  renderComponent2 as renderComponent,
  scope,
  setTemplate,
  setVMFallback,
  splat,
  str,
  template,
  when,
  yieldTo
};
