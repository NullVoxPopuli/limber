As seen previously, `on` was used to listen for `input` events on an input.

The `on` modifier can be thought of as an alias for [`addEventListener`][mdn-addEventListener], so anything it can do, `on` can do.

For example, try observing the x / y coordinates of the mouse on this div:

```hbs
<div {{on 'mousemove' handleMouseMove}}>
  The mouse position is
  {{m.x}}
  x
  {{m.y}}
</div>
```

When moving the cursor over the div, the rendered coordinates should update.

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/4.11/classes/Ember.Templates.helpers/methods/on?anchor=on
[mdn-addEventListener]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
