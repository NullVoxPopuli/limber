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
   * Where `{{outlet}}`s go, when the VM renders this tree as a route
   * template (see `@glimmer/dom/vm`).
   */
  outlets = null;
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
function mount(parent, before, render) {
  let b = new Block(parent.root, parent);
  let start = marker(parent.root);
  let end = marker(parent.root);
  let target = before.parentNode;
  target.insertBefore(start, before);
  target.insertBefore(render(b), before);
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
  constructor(render) {
    this.render = render;
  }
  render;
  toString() {
    return "(compiled template)";
  }
};
function template(render) {
  return new Template(render);
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

// packages/@glimmer/dom/lib/managers.ts
import { associateDestroyableChild as associateDestroyableChild2, destroy as destroy2 } from "@glimmer/destroyable";

// shim:@glimmer/manager/lib/internal/api
import { getInternalComponentManager, getInternalHelperManager, getInternalModifierManager } from "@glimmer/manager";

// shim:@glimmer/reference/lib/reference
import { createComputeRef, valueForRef } from "@glimmer/reference";

// shim:@glimmer/validator/lib/tracking
import { consumeTag, createCache, getValue, isConst, track, untrack } from "@glimmer/validator";

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
import { associateDestroyableChild as associateDestroyableChild3 } from "@glimmer/destroyable";

// shim:@glimmer/manager/lib/public/template
import { getComponentTemplate, setComponentTemplate } from "@glimmer/manager";

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
function island(b, definition, named, blocks, attrs, current) {
  if (!vmFallback) {
    throw new Error(
      `${describe(definition)} does not have a compiled template. To render it with the VM, import '@glimmer/dom/vm' (or compile with \`vmInterop\`).`
    );
  }
  let element = b.root.document.createElement("glimmer-island");
  element.style.display = "contents";
  associateDestroyableChild3(
    b,
    vmFallback.render(current ?? (() => definition), element, b.root.owner, {
      named,
      blocks,
      attrs
    })
  );
  return element;
}
function instantiate(b, definition, named, blocks, attrs, current) {
  while (definition instanceof Curried) {
    named = { ...definition.named, ...named };
    definition = definition.definition;
  }
  let compiled = templateFor(definition);
  let templateless = !compiled && !getComponentTemplate(definition) && "getDelegateFor" in (getInternalComponentManager(definition, true) ?? {});
  if (!compiled && !templateless) return island(b, definition, named, blocks, attrs, current);
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
  if (!compiled) return b.root.document.createDocumentFragment();
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
  let tag = createTag();
  let read = () => {
    consumeTag(tag);
    return current;
  };
  let render = (value) => value ? mount(b, anchor, (child) => instantiate(child, value, named, blocks, attrs, read)) : null;
  let m = render(current);
  b.updaters.push(() => {
    let next = getValue(cache);
    if (next === current) {
      m?.b.update();
      return;
    }
    if (m && vmFallback?.canUpdate(current, next)) {
      current = next;
      dirtyTag(tag);
      m.b.update();
      return;
    }
    if (m) unmount(m);
    current = next;
    m = render(next);
  });
}

// packages/@glimmer/dom/lib/render.ts
import {
  associateDestroyableChild as associateDestroyableChild4,
  destroy as destroy3,
  isDestroying,
  registerDestructor
} from "@glimmer/destroyable";
import { _backburner } from "@ember/runloop";
function startRoot(owner, document, outlets, build, cleanup) {
  let root = new Root(owner, document);
  root.outlets = outlets ?? null;
  let b = new Block(root, null);
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
    build(b);
  });
  let result;
  let rerender = () => {
    if (destroyed || isDestroying(result) || validateTag(tag, revision)) return;
    pass(() => {
      b.update();
    });
  };
  _backburner.on("end", rerender);
  result = {
    rerender,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      _backburner.off("end", rerender);
      cleanup();
      if (!isDestroying(result)) destroy3(result);
    }
  };
  associateDestroyableChild4(result, b);
  registerDestructor(result, () => {
    result.destroy();
  });
  return result;
}
function renderRoot({ into, owner = {}, outlets }, render) {
  into.innerHTML = "";
  let end = into.ownerDocument.createTextNode("");
  into.appendChild(end);
  return startRoot(
    owner,
    into.ownerDocument,
    outlets,
    (b) => {
      let m = mount(b, end, render);
      b.updaters.push(() => {
        m.b.update();
      });
    },
    () => {
      removeRange(into.firstChild, end);
    }
  );
}
function attach(element, owner, build) {
  return startRoot(owner, element.ownerDocument, void 0, build, () => {
  });
}
function renderBlock(block, params, { into, owner }) {
  return renderRoot({ into, owner }, (child) => block(child, ...params));
}
function renderComponent(component, {
  into,
  owner,
  args
}) {
  let named = {};
  if (args) {
    for (let key of Object.keys(args)) named[key] = () => args[key];
  }
  return renderRoot(
    owner ? { into, owner } : { into },
    (child) => instantiate(child, component, named, null, null)
  );
}
function renderTemplate(template2, options) {
  return renderRoot(
    options,
    (child) => template2.render(child, { self: options.self, args: options.args, blocks: null, attrs: null })
  );
}

export {
  marker,
  mount,
  unmount,
  removeRange,
  moveRange,
  html,
  clone,
  at,
  Template,
  template,
  setTemplate,
  templateFor,
  consumeTag,
  createCache,
  getValue,
  isConst,
  untrack,
  getInternalHelperManager,
  setComponentTemplate,
  createComputeRef,
  valueForRef,
  createTag,
  dirtyTag,
  capture,
  helper,
  helperDyn,
  modifier,
  curry,
  isComponentDefinition,
  setVMFallback,
  instantiate,
  invoke,
  invokeDyn,
  attach,
  renderBlock,
  renderComponent,
  renderTemplate
};
