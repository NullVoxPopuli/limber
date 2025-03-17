# Conditional Modifiers in Ember

Conditional modifiers allow you to apply modifiers to elements based on certain conditions. This is useful when you want to conditionally add event listeners, apply styles, or interact with the DOM based on the state of your application.

## Working with Conditional Modifiers

When working with conditional modifiers in Ember, it's important to understand:

1. Modifiers are functions that can interact with DOM elements
2. Conditional modifiers are applied only when a specific condition is met
3. You can use the `if` helper to conditionally apply modifiers
4. Modifiers can be combined with other template features for powerful DOM interactions

## Basic Conditional Modifiers

You can use the `if` helper to conditionally apply modifiers:

```hbs
<button {{if this.isActive (on "click" this.handleClick)}}>
  Click me
</button>
```

In this example, the `on` modifier is only applied when `isActive` is truthy.

## Multiple Conditional Modifiers

You can apply multiple conditional modifiers to the same element:

```hbs
<div
  {{if this.isHoverable (on "mouseenter" this.handleMouseEnter)}}
  {{if this.isHoverable (on "mouseleave" this.handleMouseLeave)}}
>
  Hover over me
</div>
```

## Creating Custom Conditional Modifiers

You can create custom modifiers that include conditional logic:

```js
// app/modifiers/conditional-class.js
import { modifier } from 'ember-modifier';

export default modifier(function conditionalClass(element, [condition, className]) {
  if (condition) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
  
  return () => {
    element.classList.remove(className);
  };
});
```

```hbs
<div {{conditional-class this.isActive "active"}}>
  This div will have the "active" class when isActive is true
</div>
```

<p class="call-to-play">
  Complete the <code>ConditionalModifiersDemo</code> component by:
  <ul>
    <li>Implementing conditional event listeners that are only active under specific conditions</li>
    <li>Creating a toggle button that conditionally applies different modifiers based on its state</li>
    <li>Building a hover card that uses conditional modifiers to handle mouse interactions</li>
    <li>Implementing a custom conditional modifier that applies different styles based on component state</li>
  </ul>
</p>

[Documentation for Ember modifiers][ember-modifiers]
[Documentation for if helper][ember-if-helper]
[Documentation for on modifier][ember-on-modifier]

[ember-modifiers]: https://guides.emberjs.com/release/components/template-lifecycle-dom-and-modifiers/
[ember-if-helper]: https://guides.emberjs.com/release/components/conditional-content/
[ember-on-modifier]: https://guides.emberjs.com/release/components/component-state-and-actions/#toc_event-handlers
