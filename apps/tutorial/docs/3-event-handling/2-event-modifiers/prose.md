DOM event handlers can have [modifiers][mdn-addEventListener] that alter their behavior.
For example, a handler with a `once` modifier will only run a single time:

```hbs 
<button {{on 'click' handleClick once=true}}>
  Click me
</button>
```

The full list of modifiers is covered on both [MDN][mdn-addEventListener] and the [Ember API Docs][docs].

- `capture` -- a true value indicates that events of this type will be dispatched to the registered listener before being dispatched to any `EventTarget` beneath it in the DOM tree.
- `once` -- indicates that the listener should be invoked at most once after being added. If true, the listener would be automatically removed when invoked.
- `passive` -- if true, indicates that the function specified by listener will never call `preventDefault()`. If a passive listener does call `preventDefault()`, the user agent will do nothing other than generate a console warning. See [Improving scrolling performance with passive listeners][scroll-perf] to learn more.


[Documentation][docs]

[docs]: https://api.emberjs.com/ember/4.11/classes/Ember.Templates.helpers/methods/on?anchor=on
[mdn-addEventListener]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#parameters
[scroll-perf]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners
