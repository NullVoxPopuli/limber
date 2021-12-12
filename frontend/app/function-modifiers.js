import { capabilities as modifierCapabilities, setModifierManager } from '@ember/modifier';

class FunctionalModifierManager {
  capabilities = modifierCapabilities('3.22');

  createModifier(fn, args) {
    return { fn, args, element: undefined, destructor: undefined };
  }

  installModifier(state, element) {
    state.element = element;
    this.setupModifier(state);
  }

  updateModifier(state) {
    this.destroyModifier(state);
    this.setupModifier(state);
  }

  setupModifier(state) {
    let { fn, args, element } = state;

    state.destructor = fn(element, args.positional, args.named);
  }

  destroyModifier(state) {
    if (typeof state.destructor === 'function') {
      state.destructor();
    }
  }

  getDebugName(fn) {
    return fn.name || '(anonymous function)';
  }
}

const FUNCTIONAL_MODIFIER_MANAGER = new FunctionalModifierManager();
const FUNCTIONAL_MODIFIER_MANAGER_FACTORY = () => FUNCTIONAL_MODIFIER_MANAGER;

setModifierManager(FUNCTIONAL_MODIFIER_MANAGER_FACTORY, Function.prototype);
