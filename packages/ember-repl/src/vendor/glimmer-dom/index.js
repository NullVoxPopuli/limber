// @ts-nocheck
/* eslint-disable */
/**
 * VENDORED -- do not edit.
 *
 * The runtime for compiled templates (`@glimmer/dom`, `@glimmer/dom/vm`).
 * Built from https://github.com/NullVoxPopuli-ai-agent/ember.js/tree/claude/gallant-heisenberg-aovzyr (af3aef79),
 * see https://github.com/emberjs/ember.js/pull/21649
 *
 * This is an experiment: strict-mode templates compiled directly to DOM
 * operations, with no wire format and no VM.
 */
import {
  Template,
  at,
  clone,
  consumeTag,
  createCache,
  createComputeRef,
  createTag,
  curry,
  dirtyTag,
  getInternalHelperManager,
  getValue,
  helper,
  helperDyn,
  html,
  instantiate,
  invoke,
  invokeDyn,
  isComponentDefinition,
  isConst,
  marker,
  modifier,
  mount,
  moveRange,
  removeRange,
  renderComponent,
  setTemplate,
  setVMFallback,
  template,
  unmount,
  valueForRef
} from "./shared.js";

// packages/@glimmer/dom/lib/attributes.ts
import { registerDestructor } from "@glimmer/destroyable";
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
function sanitize(element2, name, value) {
  if (value === null || !SANITIZED_TAGS.has(element2.tagName) || !SANITIZED_ATTRS.has(name)) {
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
function setterFor(element2, name) {
  if (element2.namespaceURI === XHTML && PROPERTIES.has(name) && name in element2) {
    return (value) => {
      element2[name] = value === null || value === void 0 ? name === "value" ? "" : false : value;
    };
  }
  return (value) => {
    let normalized = sanitize(element2, name, normalizeAttrValue(value));
    if (normalized === null) {
      element2.removeAttribute(name);
    } else {
      element2.setAttribute(name, normalized);
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
function classPart(b, element2, value) {
  let state = CLASSES.get(element2);
  if (!state) {
    state = { parts: [] };
    let existing = element2.getAttribute("class");
    if (existing) state.parts.push(existing);
    CLASSES.set(element2, state);
  }
  let { parts } = state;
  let index = parts.length;
  parts.push("");
  bind(b, value, (next) => {
    parts[index] = normalizeAttrValue(next) ?? "";
    let className = parts.filter(Boolean).join(" ");
    if (className) {
      element2.setAttribute("class", className);
    } else {
      element2.removeAttribute("class");
    }
  });
}
function attr(b, element2, name, value) {
  if (name === "class") {
    classPart(b, element2, value);
  } else {
    bind(b, value, setterFor(element2, name));
  }
}
function splat(b, element2, ctx) {
  ctx.attrs?.(b, element2);
}
function describeElement(element2) {
  return element2.tagName.toLowerCase() + (element2.id ? `#${element2.id}` : "") + Array.from(element2.classList).map((c) => `.${c}`).join("");
}
function assertHandler(fn, element2) {
  if (typeof fn !== "function") {
    throw new Error(
      `You must pass a function as the second argument to the \`on\` modifier; you passed ${fn === null ? "null" : typeof fn}. While rendering:

(unknown) on ${describeElement(element2)}`
    );
  }
}
function listen(b, element2, eventName, handler, options) {
  let cache = createCache(handler);
  let listener = (event) => {
    let fn = getValue(cache);
    assertHandler(fn, element2);
    return fn(event);
  };
  b.root.schedule(() => {
    if (typeof eventName !== "string" || !eventName) {
      throw new Error(
        `You must pass a valid DOM event name as the first argument to the \`on\` modifier on ${describeElement(element2)}`
      );
    }
    assertHandler(getValue(cache), element2);
    element2.addEventListener(eventName, listener, options);
    registerDestructor(b, () => {
      element2.removeEventListener(eventName, listener, options);
    });
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

// packages/@glimmer/dom/lib/element.ts
var ELEMENTS = /* @__PURE__ */ new Map();
function element(tagName) {
  if (typeof tagName !== "string") {
    throw new Error(
      `The argument passed to the \`element\` helper must be a string (you passed \`${String(tagName)}\`)`
    );
  }
  let existing = ELEMENTS.get(tagName);
  if (existing) return existing;
  let created = template((b, ctx) => {
    let doc = b.root.document;
    let fragment = doc.createDocumentFragment();
    let anchor = marker(b.root);
    if (tagName === "") {
      fragment.appendChild(anchor);
    } else {
      let el = doc.createElement(tagName);
      splat(b, el, ctx);
      el.appendChild(anchor);
      fragment.appendChild(el);
    }
    yieldTo(b, anchor, ctx, "default", []);
    return fragment;
  });
  ELEMENTS.set(tagName, created);
  return created;
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
  element,
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
  renderComponent,
  scope,
  setTemplate,
  setVMFallback,
  splat,
  str,
  template,
  when,
  yieldTo
};
