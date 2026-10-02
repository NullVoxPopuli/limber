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
  attach,
  capture,
  renderBlock,
  renderTemplate,
  setComponentTemplate,
  setTemplate,
  setVMFallback,
  template,
  templateFor,
  untrack
} from "./shared.js";

// packages/@glimmer/dom/lib/vm.ts
import { registerDestructor as registerDestructor2 } from "@glimmer/destroyable";

// shim:@glimmer/manager/lib/public/component
import { componentCapabilities } from "@glimmer/manager";

// shim:@glimmer/manager/lib/public/api
import { setComponentManager, setHelperManager, setModifierManager } from "@glimmer/manager";

// shim:@glimmer/manager/lib/public/modifier
import { modifierCapabilities } from "@glimmer/manager";

// shim:@glimmer/manager/lib/public/helper
import { helperCapabilities } from "@glimmer/manager";

// packages/@glimmer/dom/lib/vm.ts
import { getOwner, setOwner } from "@glimmer/owner";

// shim:@glimmer/constants/lib/curried
var CURRIED_COMPONENT = 0;

// shim:@glimmer/runtime/lib/curried-value
import { CurriedValue } from "@glimmer/runtime";
import { curry } from "@glimmer/runtime";
var isCurriedValue = (value) => value instanceof CurriedValue;

// shim:@glimmer/validator/lib/collections/array
import { trackedArray } from "@glimmer/validator";

// shim:@ember/-internals/glimmer/lib/base-renderer
import { renderComponent } from "@ember/renderer";
import { registerDestructor } from "@glimmer/destroyable";
var BaseRenderer = class _BaseRenderer {
  static strict(owner) {
    return new _BaseRenderer(owner);
  }
  constructor(owner) {
    this.owner = owner;
  }
  render(component, { into, args }) {
    let result = renderComponent(component, { into, owner: this.owner, args });
    let destroyable = {};
    registerDestructor(destroyable, () => result.destroy());
    return destroyable;
  }
};

// packages/@glimmer/dom/lib/vm.ts
import templateOnly from "@ember/component/template-only";
import { createTemplateFactory } from "@ember/template-factory";
var RENDERERS = /* @__PURE__ */ new WeakMap();
function rendererFor(owner) {
  let renderer = RENDERERS.get(owner);
  if (!renderer) {
    renderer = BaseRenderer.strict(owner, document, {
      isInteractive: true,
      hasDOM: true
    });
    RENDERERS.set(owner, renderer);
  }
  return renderer;
}
var ApplyAttrsManager = class {
  capabilities = modifierCapabilities("3.22");
  constructor(owner) {
    this.owner = owner;
  }
  createModifier(_definition, args) {
    return {
      attrs: args.positional[0],
      result: null
    };
  }
  installModifier(state, element) {
    let {
      attrs
    } = state;
    if (attrs) {
      state.result = attach(element, this.owner, (b) => {
        attrs(b, element);
      });
    }
  }
  updateModifier() {
  }
  destroyModifier(state) {
    state.result?.destroy();
  }
};
var applyAttrs = setModifierManager((owner) => new ApplyAttrsManager(owner), {});
var BlockIslandManager = class {
  capabilities = helperCapabilities("3.23", {
    hasValue: true,
    hasDestroyable: true
  });
  constructor(owner) {
    this.owner = owner;
  }
  createHelper(_definition, args) {
    let block = args.positional[0];
    let params = [1, 2, 3].map((i) => () => args.positional[i]);
    return untrack(() => {
      let element = document.createElement("glimmer-island");
      element.style.display = "contents";
      let result = renderBlock(block, params, {
        into: element,
        owner: this.owner
      });
      return {
        element,
        result
      };
    });
  }
  getValue(island2) {
    return island2.element;
  }
  getDestroyable(island2) {
    return island2.result;
  }
};
var blockIsland = setHelperManager((owner) => new BlockIslandManager(owner ?? {}), {});
var INVOKE = setComponentTemplate(createTemplateFactory(
  /*
    {{#if @block}}<@definition {{applyAttrs @attrs}} as |a b c|>{{blockIsland @block a b c}}</@definition>{{else}}<@definition {{applyAttrs @attrs}} />{{/if}}
  */
  {
    "id": null,
    "block": '[[[41,[30,1],[[[8,[30,2],[[4,[32,0],[[30,3]],null]],null,[["default"],[[[[1,[28,[32,1],[[30,1],[30,4],[30,5],[30,6]],null]]],[4,5,6]]]]]],[]],[[[8,[30,2],[[4,[32,0],[[30,3]],null]],null,null]],[]]]],["@block","@definition","@attrs","a","b","c"],["if"]]',
    "moduleName": "packages/@glimmer/dom/lib/invoke.hbs",
    "scope": () => ({
      applyAttrs,
      blockIsland
    }),
    "isStrictMode": true
  }
), templateOnly());
setVMFallback({
  render(definition, into, owner, {
    named,
    blocks,
    attrs
  }) {
    let args = capture(named, null);
    let last;
    let curried;
    return rendererFor(owner).render(INVOKE, {
      into,
      args: {
        get definition() {
          let value = definition();
          if (value !== last || !curried) {
            last = value;
            curried = curry(CURRIED_COMPONENT, value, owner, args);
          }
          return curried;
        },
        attrs,
        block: blocks?.["default"] ?? null
      }
    });
  },
  canUpdate(from, to) {
    return isCurriedValue(from) && isCurriedValue(to);
  }
});
var TemplateOnlyState = class {
  constructor(template3, args) {
    this.template = template3;
    this.args = args;
  }
};
function createIsland(context) {
  return untrack(() => {
    let template3;
    let self;
    let args;
    if (context instanceof TemplateOnlyState) {
      template3 = context.template;
      self = void 0;
      args = context.args;
    } else {
      template3 = templateFor(context.constructor);
      self = context;
      args = context.args ?? {};
    }
    if (!template3) {
      throw new Error("BUG: rendering a compiled component without a compiled template");
    }
    let element = document.createElement("glimmer-island");
    element.style.display = "contents";
    let outlets = trackedArray([]);
    let result = renderTemplate(template3, {
      into: element,
      owner: getOwner(context) ?? {},
      self,
      args,
      outlets: {
        add(outlet2) {
          outlets.push(outlet2);
          return () => {
            let index = outlets.indexOf(outlet2);
            if (index !== -1) outlets.splice(index, 1);
          };
        }
      }
    });
    return {
      element,
      outlets,
      result
    };
  });
}
var IslandHelperManager = class {
  capabilities = helperCapabilities("3.23", {
    hasValue: true,
    hasDestroyable: true
  });
  createHelper(_definition, args) {
    return createIsland(args.positional[0]);
  }
  getValue(island2) {
    return island2;
  }
  getDestroyable(island2) {
    return island2.result;
  }
};
var island = setHelperManager(() => new IslandHelperManager(), {});
var BRIDGE = createTemplateFactory(
  /*
    {{#let (island this) as |i|}}{{i.element}}{{#each i.outlets as |el|}}{{#in-element el insertBefore=null}}<@outlet />{{/in-element}}{{/each}}{{/let}}
  */
  {
    "id": null,
    "block": '[[[44,[[28,[32,0],[[30,0]],null]],[[[1,[30,1,["element"]]],[42,[28,[31,2],[[28,[31,2],[[30,1,["outlets"]]],null]],null],null,[[[40,[[[8,[30,3],null,null,null]],[]],"%cursor:0%",[28,[31,4],[[30,2]],null],null]],[2]],null]],[1]]]],["i","el","@outlet"],["let","each","-track-array","in-element","-in-el-null"]]',
    "moduleName": "packages/@glimmer/dom/lib/vm.hbs",
    "scope": () => ({
      island
    }),
    "isStrictMode": true
  }
);
var CAPABILITIES = componentCapabilities("3.13", {});
var TemplateOnlyManager = class {
  capabilities = CAPABILITIES;
  constructor(owner) {
    this.owner = owner;
  }
  createComponent(definition, args) {
    let state = new TemplateOnlyState(definition, args.named);
    setOwner(state, this.owner);
    return state;
  }
  getContext(state) {
    return state;
  }
};
function vmCompatible(t) {
  setComponentManager((owner) => new TemplateOnlyManager(owner), t);
  setComponentTemplate(BRIDGE, t);
  return t;
}
function template2(render) {
  return vmCompatible(template(render));
}
function setTemplate2(definition, t) {
  setTemplate(definition, t);
  setComponentTemplate(BRIDGE, definition);
  return definition;
}
function outlet(b, anchor) {
  let sink = b.root.outlets;
  if (!sink) {
    throw new Error("{{outlet}} can only be used in a template that the router renders (a route template)");
  }
  let element = b.root.document.createElement("glimmer-outlet");
  element.style.display = "contents";
  anchor.parentNode.insertBefore(element, anchor);
  let remove = sink.add(element);
  registerDestructor2(b, remove);
}
export {
  outlet,
  setTemplate2 as setTemplate,
  template2 as template,
  vmCompatible
};
