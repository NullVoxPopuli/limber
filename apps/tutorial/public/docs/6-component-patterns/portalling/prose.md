# Portalling in Ember

Portalling is a technique that allows you to render content in a different part of the DOM tree than where the component is defined. This is particularly useful for creating modals, tooltips, dropdowns, and other UI elements that need to break out of their parent's layout constraints.

## Understanding Portalling

When working with portalling in Ember, it's important to understand:

1. Content is defined in one location but rendered elsewhere in the DOM
2. The `{{in-element}}` helper is used to move content to a different DOM element
3. Portalling maintains the component's context and reactivity
4. The target element must exist in the DOM before portalling content to it

## Basic Portalling with {{in-element}}

The `{{in-element}}` helper is the primary way to implement portalling in Ember:

```hbs
{{#in-element this.targetElement}}
  <div class="portalled-content">
    This content will be rendered in the target element.
  </div>
{{/in-element}}
```

Where `targetElement` is a reference to a DOM element:

```js
get targetElement() {
  return document.getElementById('portal-target');
}
```

## Creating a Portal Target

Before you can portal content, you need a target element in the DOM:

```html
<div id="portal-target"></div>
```

This element is typically placed at the root level of your application, outside of any layout constraints.

## Maintaining Context and Reactivity

Content rendered through a portal maintains its component context and reactivity:

```hbs
{{#in-element this.targetElement}}
  <div class="portalled-content">
    <h2>{{@title}}</h2>
    <p>{{@content}}</p>
    <button {{on "click" this.close}}>Close</button>
  </div>
{{/in-element}}
```

<p class="call-to-play">
  Complete the <code>PortallingDemo</code> component by:
  <ul>
    <li>Implementing a portal that renders content in a different part of the DOM</li>
    <li>Creating a button that triggers the display of portalled content</li>
    <li>Ensuring the portalled content maintains its component context and reactivity</li>
    <li>Adding a way to close or hide the portalled content</li>
  </ul>
</p>

[Documentation for in-element helper][ember-in-element]
[Documentation for DOM manipulation in Ember][ember-dom-manipulation]
[Documentation for component lifecycle][ember-component-lifecycle]

[ember-in-element]: https://guides.emberjs.com/release/components/template-lifecycle-dom-and-modifiers/#toc_in-element
[ember-dom-manipulation]: https://guides.emberjs.com/release/components/template-lifecycle-dom-and-modifiers/
[ember-component-lifecycle]: https://guides.emberjs.com/release/components/component-state-and-actions/
