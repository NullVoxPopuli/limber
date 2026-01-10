Portalling allows you to render content in a different location in the DOM than where it's declared in your component hierarchy. 

The `{{in-element}}` helper enables portalling:

```hbs
<div id="modal-root"></div>

{{#in-element (findTarget '#modal-root')}}
  This content renders in #modal-root
{{/in-element}}
```

<p class="call-to-play">
  Try creating a portal that renders content in a target element when a button is clicked.
</p>

**Note:** The target element must exist in the DOM before the `{{in-element}}` helper runs. You can use modifiers or lifecycle hooks to ensure proper timing.

<hr />

References:
- [Docs: `{{in-element}}`][docs]

[docs]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/in-element?anchor=in-element
