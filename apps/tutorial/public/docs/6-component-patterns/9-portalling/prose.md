# Portalling with in-element

Portalling is a technique that allows you to render content in a different part of the DOM than where the component is defined. This is particularly useful for modals, tooltips, and other UI elements that need to break out of their parent's layout constraints.

In Ember/Glimmer, portalling is achieved using the `in-element` helper, which takes a DOM element reference and renders its content into that element.

```hbs
{{#in-element (findElement '#portal-target')}}
  Content to render elsewhere
{{/in-element}}
```

This is especially useful for:
- Modal dialogs that need to appear above all other content
- Tooltips that need to break out of overflow: hidden containers
- Dropdown menus that need to extend beyond their parent's boundaries
- Any content that needs to escape z-index stacking contexts

<p class="call-to-play">
  Complete the <code>Portal</code> component to render its content in the target element.
</p>

[Documentation][docs-in-element]

[docs-in-element]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/in-element?anchor=in-element
